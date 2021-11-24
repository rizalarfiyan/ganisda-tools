package mail

import "errors"

var (
	errTemplate          = errors.New("error template not found")
	errListDataIsAlready = errors.New("list data is already exist")
)
