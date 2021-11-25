package app

import (
	"ganisda-email-sender/config"
	"ganisda-email-sender/mail"
	"ganisda-email-sender/utils"
	"sync"
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

	if err = a.mail.ValidateMailCSV(data); err != nil {
		return err
	}

	emailConfig := a.mail.MailConnection()

	message := mail.MailMessage{
		WaitGroup: &sync.WaitGroup{},
		Mutex:     &sync.Mutex{},
		Message:   make(chan string),
	}

	message.WaitGroup.Add(len(data))
	for _, val := range data {
		go a.mail.SendMail(message, emailConfig, val)
	}

	go func() {
		message.WaitGroup.Wait()
		close(message.Message)
	}()
	a.mail.ReadMailMessage(message)

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
