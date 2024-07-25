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
	pnpm install
	make build
	make build-docs
	make ci
	serverless deploy --stage production --region ap-northeast-2  --aws-profile personal
	pnpm install

FUNCTION_NAME = v1_task_list
target:
	make build
	serverless deploy function --function $(FUNCTION_NAME) --stage production --region ap-northeast-2  --aws-profile personal --force

