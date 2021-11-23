package mail

import (
	"bytes"
	"fmt"
	"ganisda-email-sender/config"
	"html/template"
	"io/ioutil"
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
