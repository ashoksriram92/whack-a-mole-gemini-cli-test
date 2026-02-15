build-GetScoresFunction:
	rm -rf node_modules
	npm install --cache .npm-cache # Install runtime & test deps
	npm test                     # Run tests
	cp get-scores.js "$(ARTIFACTS_DIR)"

build-AddScoreFunction:
	rm -rf node_modules
	npm install --cache .npm-cache # Install runtime & test deps
	npm test                     # Run tests
	cp add-score.js "$(ARTIFACTS_DIR)"
