package utils

import "regexp"

const (
	regexEmail      = "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
	regexAlphaSpace = "^[a-zA-Z ]+$"
)

func IsEmail(str string) bool {
	re := regexp.MustCompile(regexEmail)
	return !re.MatchString(str)
}

func IsAlphaSpace(str string) bool {
	re := regexp.MustCompile(regexAlphaSpace)
	return !re.MatchString(str)
}
