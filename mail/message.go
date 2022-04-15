package mail

import "errors"

var (
	errTemplate          = errors.New("error template not found")
	errListDataIsAlready = errors.New("list data is already exist")
	errInvalidCSV        = errors.New("error, someting problem in csv file")

	errRowEmail         = "Error invalid email in %v (%v)"
	errRowFullName      = "Error invalid full name in %v (%v)"
	errRowRole          = "Error invalid role in %v (%v)"
	errRowUrl           = "Error invalid url in %v (%v)"
	errFileUserNotFound = "Error file %v is not found in path %v"

	emailSuccess = "Successfully sent email to %v <%v>"
)
