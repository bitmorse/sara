# Makefile for sara-gui — SARA desktop app (Tauri v2)

APP_NAME    := Requirements
BUNDLE_DIR  := src-tauri/target/release/bundle/macos
APP_BUNDLE  := $(BUNDLE_DIR)/$(APP_NAME).app
INSTALL_DIR := /Applications

.PHONY: help start dev deps build install uninstall clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

deps: ## Install JS dependencies if missing
	@[ -d node_modules ] || npm install

start dev: deps ## Run the desktop app in development mode
	npm run tauri dev

build: deps ## Build the release .app bundle
	npm run tauri build

install: build ## Build and install the app into /Applications
	@echo "Installing $(APP_NAME).app to $(INSTALL_DIR)…"
	@rm -rf "$(INSTALL_DIR)/$(APP_NAME).app"
	@cp -R "$(APP_BUNDLE)" "$(INSTALL_DIR)/"
	@echo "Installed. Launch it from Applications or run: open -a \"$(APP_NAME)\""

uninstall: ## Remove the app from /Applications
	@rm -rf "$(INSTALL_DIR)/$(APP_NAME).app"
	@echo "Removed $(APP_NAME).app from $(INSTALL_DIR)."

clean: ## Remove build artifacts
	rm -rf dist
	rm -rf src-tauri/target/release/bundle
