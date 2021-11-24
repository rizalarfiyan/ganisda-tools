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
	file := a.mail.GetCSVLocation()
	data, err := a.mail.ReadMailCSV(file)
	if err != nil {
		return err
	}

	//! not include Validate Files
	if err = a.mail.ValidateMailCSV(data); err != nil {
		return err
	}

	filed := mail.TemplateField{
		Title: "Ini adalah judul",
		Name:  "Muhamad Rizal Arfiyan",
	}

	_, err = a.mail.GenerateTemplate(filed)
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

	file := a.mail.GetCSVLocation()
	err = a.mail.GenerateMailCSV(file)
	if err != nil {
		return err
	}

	return nil
}
