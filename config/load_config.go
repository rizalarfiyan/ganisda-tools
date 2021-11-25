package config

import (
	"encoding/json"
	"io/ioutil"
	"os"
)

func LoadConfig() (*Config, error) {
	jsonFile, err := os.Open("config.json")
	if err != nil {
		return nil, err
	}

	defer jsonFile.Close()
	byteValue, _ := ioutil.ReadAll(jsonFile)

	config := &Config{}
	json.Unmarshal(byteValue, config)
	return config, nil
}
