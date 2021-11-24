package mail

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"ganisda-email-sender/config"
	"ganisda-email-sender/utils"
	"html/template"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"regexp"
)

type mailService struct {
	config *config.Config
}

type MailService interface {
	GetTemplate() (*string, error)
	GenerateTemplate(TemplateField) (*string, error)
	GenerateMailCSV(string) error
	GetCSVLocation() string
	ReadMailCSV(string) ([][]string, error)
	ValidateMailCSV([][]string) error
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
	minifier := m.htmlMinifier(result)
	return &minifier, nil
}

func (m *mailService) htmlMinifier(html string) string {
	re := regexp.MustCompile(`(?m)<!--(.*?)-->|\s\B`)
	return re.ReplaceAllString(html, "")
}

func (m *mailService) GetCSVLocation() string {
	fileName := fmt.Sprint(m.config.ListData, ".", listDataExtension)
	filePath := path.Join(".", m.config.DataLocation, fileName)
	return filePath
}

func (m *mailService) GenerateMailCSV(filePath string) error {
	if utils.FileIsExist(filePath) {
		return errListDataIsAlready
	}

	strCSV := [][]string{
		{"Email", "Nama lengkap", "File Certicate"},
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
		if utils.IsEmail(col[0]) {
			row := fmt.Sprint("A", numCol)
			errorRow = append(errorRow, fmt.Sprintf(errRowEmail, row))
		}
		if utils.IsAlphaSpace(col[1]) {
			row := fmt.Sprint("B", numCol)
			errorRow = append(errorRow, fmt.Sprintf(errRowEmail, row))
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
