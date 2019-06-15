## Preparation

### Create configuration file

App now using [config package](https://www.npmjs.com/package/config) to manage configuration. 

Create custom configuration file `custom_file.json` (for example) with

```json
{
  "log4js": {
	"appenders": {
	  "console": {
		"type": "stdout"
	  },
	  "logfile": {
		"type": "dateFile",
		"filename": "logs/bot.log",
		"compress": true
	  }
	},
	"categories": {
	  "default": {
		"appenders": [
		  "console",
		  "logfile"
		],
		"level": "debug"
	  }
	}
  },
  "mongoose": {
	"uri": "mongodb://localhost:27017/dev_shopify_crawler",
	"options": {
	  "useNewUrlParser": true,
    "useCreateIndex": true
	}
  },
  "chrome": {
	"args": [
	  "--no-sandbox",
	  "--disable-setuid-sandbox",
	  "--disable-infobars",
	  "--window-position=0,0",
	  "--ignore-certifcate-errors",
	  "--ignore-certifcate-errors-spki-list"
	],
	"headless": true,
	"ignoreHTTPSErrors": true
  },
  "PAGES_PER_ITERATION": 8,
  "PRODUCTS_REVIEW": 50
}
```

Update environment variable `NODE_ENV` (for example):

```sh
export NODE_ENV=custom_file
```

### Install dependencies

Run command `npm install`

## Running app

Run command `npm start`
