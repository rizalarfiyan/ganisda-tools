package mail

import "sync"

type TemplateField struct {
	Title string
	Name  string
	Role  string
	Url   string
}

type MailMessage struct {
	WaitGroup *sync.WaitGroup
	Mutex     *sync.Mutex
	Message   chan string
}

func (m *MailMessage) SetMessage(message string) {
	m.Mutex.Lock()
	m.Message <- message
	m.Mutex.Unlock()
}
