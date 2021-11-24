package app

import (
	"ganisda-email-sender/config"
	"ganisda-email-sender/mail"
	"ganisda-email-sender/utils"
)

type appMail struct {
	config *config.Config
	mail   mail.MailService
}

type AppMail interface {
	Run() error
	Generate() error
}

func NewMailApp(conf *config.Config) AppMail {
	return &appMail{
		config: conf,
		mail:   mail.NewMailService(conf),
	}
}

func (a *appMail) Run() error {

	filed := mail.TemplateField{
		Title: "Ini adalah judul",
		Name:  "Muhamad Rizal Arfiyan",
	}

	_, err := a.mail.GenerateTemplate(filed)
	if err != nil {
		return err
	}

	return nil
}

func (a *appMail) Generate() error {
	err := utils.CreateDirectory(a.config.DataLocation)
	if err != nil {
		return err
	}

	err = a.mail.GenerateMailCSV()
	if err != nil {
		return err
	}

	return nil
}
