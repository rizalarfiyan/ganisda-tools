package mail

import (
	"bytes"
	"crypto/tls"
	"encoding/csv"
	"fmt"
	"ganisda-tools/config"
	"ganisda-tools/utils"
	"html/template"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"time"

	go_mail "github.com/xhit/go-simple-mail/v2"
)

type mailService struct {
	config *config.Config
}

type MailService interface {
	GetTemplate() (*string, error)
	GenerateTemplate(TemplateField) (*string, error)
	GenerateMailCSV(string) error
	GetCSVLocation() string
	GetUserFileLocation(string) string
	GetUserFileName(string) string
	ReadMailCSV(string) ([][]string, error)
	ValidateMailCSV([][]string) error
	MailConnection() *go_mail.SMTPServer
	SendMail(message MailMessage, server *go_mail.SMTPServer, userData []string)
	ReadMailMessage(message MailMessage)
}

func NewMailService(conf *config.Config) MailService {
	return &mailService{
		config: conf,
	}
}

func (m *mailService) GetTemplate() (*string, error) {
	files, err := ioutil.ReadDir(m.config.TemplateLocation)
	if err != nil {
		return nil, err
	}

	for _, f := range files {
		getFileName := f.Name()
		extension := filepath.Ext(getFileName)
		fileName := getFileName[0 : len(getFileName)-len(extension)]
		noDotExtension := extension[1:len(string(extension))]
		if m.config.TemplateFile == fileName && noDotExtension == allowTemplate {
			setFileName := fmt.Sprintf("%v.%v", fileName, allowTemplate)
			return &setFileName, nil
		}
	}

	return nil, errTemplate
}

func (m *mailService) GenerateTemplate(field TemplateField) (*string, error) {
	getTemplate, err := m.GetTemplate()
	if err != nil {
		return nil, err
	}

	filepath := path.Join(m.config.TemplateLocation, *getTemplate)
	tmpl, err := template.ParseFiles(filepath)
	if err != nil {
		return nil, err
	}

	data := map[string]interface{}{
		"title": field.Title,
		"name":  field.Name,
	}

	var tpl bytes.Buffer
	if err := tmpl.Execute(&tpl, data); err != nil {
		return nil, err
	}

	result := tpl.String()
	return &result, nil
}

func (m *mailService) GetCSVLocation() string {
	fileName := fmt.Sprint(m.config.ListData, ".", listDataExtension)
	filePath := path.Join(".", m.config.DataLocation, fileName)
	return filePath
}

func (m *mailService) GetUserFileLocation(name string) string {
	fileName := m.GetUserFileName(name)
	filePath := path.Join(".", m.config.DataLocation, m.config.FileLocation, fileName)
	return filePath
}

func (m *mailService) GetUserFileName(name string) string {
	return fmt.Sprint(m.config.PrefixName, " - ", name, ".", m.config.ExtensionName)
}

func (m *mailService) GenerateMailCSV(filePath string) error {
	if utils.FileIsExist(filePath) {
		return errListDataIsAlready
	}

	strCSV := [][]string{
		{"Email", "Nama lengkap"},
	}

	f, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer f.Close()

	w := csv.NewWriter(f)
	err = w.WriteAll(strCSV)
	if err != nil {
		return err
	}

	return nil
}

func (m *mailService) ReadMailCSV(fileName string) ([][]string, error) {
	f, err := os.Open(fileName)

	if err != nil {
		return [][]string{}, err
	}

	defer f.Close()
	r := csv.NewReader(f)
	if _, err := r.Read(); err != nil {
		return [][]string{}, err
	}

	result, err := r.ReadAll()

	if err != nil {
		return [][]string{}, err
	}

	return result, nil
}

func (m *mailService) ValidateMailCSV(data [][]string) error {
	var errorRow []string
	for idx, col := range data {
		numCol := idx + 2
		email := col[0]
		name := col[1]

		if utils.IsEmail(email) {
			row := fmt.Sprint("A", numCol)
			errorRow = append(errorRow, fmt.Sprintf(errRowEmail, row))
		}
		if utils.IsAlphaSpace(name) {
			row := fmt.Sprint("B", numCol)
			errorRow = append(errorRow, fmt.Sprintf(errRowFullName, row))
		}
		if !utils.FileIsExist(m.GetUserFileLocation(name)) {
			errorRow = append(errorRow, fmt.Sprintf(errFileUserNotFound, name))
		}
	}
	if len(errorRow) != 0 {
		for _, val := range errorRow {
			fmt.Println(val)
		}
		return errInvalidCSV
	}
	return nil
}

func (m *mailService) MailConnection() *go_mail.SMTPServer {
	server := go_mail.NewSMTPClient()
	server.Host = m.config.MailHost
	server.Port = m.config.MailPort
	server.Username = m.config.MailUsername
	server.Password = m.config.MailPassword
	server.Encryption = go_mail.EncryptionTLS
	server.KeepAlive = true
	server.ConnectTimeout = 30 * time.Second
	server.SendTimeout = 30 * time.Second
	server.TLSConfig = &tls.Config{InsecureSkipVerify: true}
	return server
}

func (m *mailService) SendMail(message MailMessage, server *go_mail.SMTPServer, userData []string) {
	defer message.WaitGroup.Done()

	userEmail := userData[0]
	userName := userData[1]

	filed := TemplateField{
		Title: m.config.MailSubject,
		Name:  userName,
	}

	template, err := m.GenerateTemplate(filed)
	if err != nil {
		message.SetMessage(err.Error())
		return
	}

	smtpClient, err := server.Connect()
	if err != nil {
		message.SetMessage(err.Error())
		return
	}

	email := go_mail.NewMSG()
	from := fmt.Sprintf("%v <%v>", m.config.MailFromText, m.config.MailFrom)
	email.SetFrom(from).AddTo(userEmail).SetSubject(m.config.MailSubject)
	email.SetBody(go_mail.TextHTML, *template)

	fileLocation := m.GetUserFileLocation(userName)
	fileByte, err := ioutil.ReadFile(fileLocation)
	if err != nil {
		message.SetMessage(err.Error())
		return
	}

	fileName := m.GetUserFileName(userName)
	extension := filepath.Ext(fileLocation)
	noDotExtension := extension[1:len(string(extension))]

	email.AddAttachmentData(fileByte, fileName, noDotExtension)

	if email.Error != nil {
		message.SetMessage(err.Error())
		return
	}

	err = email.Send(smtpClient)
	if err != nil {
		message.SetMessage(err.Error())
		return
	}

	successMessage := fmt.Sprintf(emailSuccess, userName, userEmail)
	message.SetMessage(successMessage)
}

func (m *mailService) ReadMailMessage(message MailMessage) {
	for msg := range message.Message {
		fmt.Println(msg)
		fmt.Println()
	}
}
