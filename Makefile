SCRIPTS := $(shell find scripts -mindepth 1 -maxdepth 1 -type d | sed 's|^scripts/||' | sort)
OTHER_SCRIPTS := $(filter-out core,$(SCRIPTS))
JOBS ?= $(shell sysctl -n hw.ncpu 2>/dev/null || nproc 2>/dev/null || echo 4)

.PHONY: install build clean typecheck format new-script $(SCRIPTS)

install:
	yarn install

typecheck:
	yarn typecheck

format:
	yarn format

new-script:
ifndef NAME
	$(error NAME is required. Usage: make new-script NAME=my-feature)
endif
	node tooling/new-script.mjs "$(NAME)"

# core first; remaining packages build in parallel
build: core
	$(MAKE) -j$(JOBS) $(OTHER_SCRIPTS)

$(SCRIPTS):
	yarn workspace @teh/$@ build

clean:
	rm -rf dist
