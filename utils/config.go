package utils

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

type Config struct {
	UserEmail string `json:"user_email"`
}

func LoadConfig() (*Config, error) {
	jsonFile, err := os.Open("config.json")
	if err != nil {
		return nil, err
	}

	fmt.Println("Successfully opened config.json")
	defer jsonFile.Close()
	byteValue, _ := ioutil.ReadAll(jsonFile)

	config := &Config{}
	json.Unmarshal(byteValue, config)
	return config, nil
}
