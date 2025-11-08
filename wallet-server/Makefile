.PHONY: build run test clean install

# Build the project
build:
	cargo build --release

# Run the server
run:
	cargo run

# Run in release mode
run-release:
	cargo run --release

# Run tests
test:
	cargo test

# Clean build artifacts
clean:
	cargo clean

# Install dependencies
install:
	cargo build

# Run with hot reload (requires cargo-watch)
watch:
	cargo watch -x run

# Check code
check:
	cargo check

# Format code
fmt:
	cargo fmt

# Lint code
lint:
	cargo clippy

