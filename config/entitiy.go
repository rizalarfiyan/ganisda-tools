package config

type Config struct {
	UserEmail        string `json:"user_email"`
	TemplateLocation string `json:"template_location"`
	TemplateFile     string `json:"template_file"`
	DataLocation     string `json:"data_location"`
	ListData         string `json:"list_data"`
}
