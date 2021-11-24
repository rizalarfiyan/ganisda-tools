package mail

import "errors"

var (
	errTemplate          = errors.New("error template not found")
	errListDataIsAlready = errors.New("list data is already exist")
	errInvalidCSV        = errors.New("error, someting problem in csv file")

	errRowEmail         = "Error invalid email in %v"
	errRowFullName      = "Error invalid full name in %v"
	errFileUserNotFound = "Error file %v is not found"
)
