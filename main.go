package main

import (
	"ganisda-tools/app"
	"ganisda-tools/config"
	"log"
	"os"

	"github.com/urfave/cli/v2"
)

func main() {
	config, err := config.LoadConfig()
	if err != nil {
		log.Fatal(err)
	}

	app := &cli.App{
		Commands: []*cli.Command{
			{
				Name:    "mail",
				Aliases: []string{"m"},
				Usage:   "run command for sender email",
				Action: func(c *cli.Context) error {
					err := app.NewMailApp(config).Run()
					if err != nil {
						return err
					}
					return nil
				},
			},
			{
				Name:    "generate",
				Aliases: []string{"g"},
				Usage:   "run command for generate csv template.",
				Action: func(c *cli.Context) error {
					err := app.NewMailApp(config).Generate()
					if err != nil {
						return err
					}
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
