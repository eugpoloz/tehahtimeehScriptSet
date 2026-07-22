.PHONY: install build clean typecheck new-script \
	core html-footer main-reply web-components \
	generate-custom-fields generate-random-portraits multiacc-quick-login

install:
	yarn install

typecheck:
	yarn typecheck

new-script:
ifndef NAME
	$(error NAME is required. Usage: make new-script NAME=my-feature)
endif
	node tooling/new-script.mjs "$(NAME)"

# core first so consumers that expect window.teh exist in docs/load order
core:
	yarn workspace @teh/core build

html-footer:
	yarn workspace @teh/html-footer build

main-reply:
	yarn workspace @teh/main-reply build

web-components:
	yarn workspace @teh/web-components build

generate-custom-fields:
	yarn workspace @teh/generate-custom-fields build

generate-random-portraits:
	yarn workspace @teh/generate-random-portraits build

multiacc-quick-login:
	yarn workspace @teh/multiacc-quick-login build

build: core html-footer main-reply web-components generate-custom-fields generate-random-portraits multiacc-quick-login

clean:
	rm -rf scripts/*/dist
