package main

import (
	"errors"
	"fmt"
	"ganisda-email-sender/utils"
	"log"
	"os"

	"github.com/urfave/cli/v2"
)

func main() {
	config, err := utils.LoadConfig()
	if err != nil {
		log.Fatal(err)
	}

	app := &cli.App{
		Commands: []*cli.Command{
			{
				Name:    "pdf",
				Aliases: []string{"p"},
				Usage:   "run command for make pdf files",
				Action: func(c *cli.Context) error {
					fmt.Println("run command for make pdf files")
					fmt.Println(config)
					return nil
				},
			},
			{
				Name:    "mail",
				Aliases: []string{"m"},
				Usage:   "run command for sender email",
				Action: func(c *cli.Context) error {
					var files string
					if c.NArg() > 0 {
						files = c.Args().Get(0)
					}
					if files == "" {
						return errors.New("missing argument 1, file excel does'n exist")
					}
					fmt.Println("run command for sender email")
					return nil
				},
			},
		},
	}

	err = app.Run(os.Args)
	if err != nil {
		log.Fatal(err)
	}
}
