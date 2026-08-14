.PHONY: trigger-update

trigger-update:
	gh workflow run update-data.yml
