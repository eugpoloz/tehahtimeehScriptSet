.PHONY: install build clean typecheck \
	core html-footer main-reply web-components \
	generate-custom-fields generate-random-portraits

install:
	yarn install

typecheck:
	yarn typecheck

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

build: core html-footer main-reply web-components generate-custom-fields generate-random-portraits

clean:
	rm -rf scripts/*/dist
