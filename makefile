ci:
	rm -rf node_modules
	yarn install --prod

clean:
	rm -rf node_modules
	rm -rf dist

build:
	rm -rf dist
	npx tsc

build-docs:
	rm -rf docs
	make build
	node scripts/build-docs.js

deploy:
	make build
	make build-docs
	serverless deploy --stage production --region ap-northeast-2  --aws-profile personal

FUNCTION_NAME = TMSDDBRecordChangedFunction
FUNCTION_NAME = TaskChangedNotificationFunction

target:
	make build
	serverless deploy function --function $(FUNCTION_NAME) --stage production --region ap-northeast-2  --aws-profile personal --force

