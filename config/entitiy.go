package config

type Config struct {
	MailUser         string `json:"mail_user"`
	MailFrom         string `json:"mail_from"`
	MailFromText     string `json:"mail_from_text"`
	MailHost         string `json:"mail_host"`
	MailPort         int    `json:"mail_port"`
	MailUsername     string `json:"mail_username"`
	MailPassword     string `json:"mail_password"`
	MailSubject      string `json:"mail_subject"`
	TemplateLocation string `json:"template_location"`
	TemplateFile     string `json:"template_file"`
	DataLocation     string `json:"data_location"`
	ListData         string `json:"list_data"`
	PrefixName       string `json:"prefix_name"`
	ExtensionName    string `json:"extension_name"`
}
