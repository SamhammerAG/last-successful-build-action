# last-successful-build-action

This action searches for the last successful workflow-run for the given workflow-name and branch. 
The `sha` of the workflow-commit is set as output-parameter. If no matching workflow exists, the `sha` of the current run is emitted.

## Usage

```yml
      - uses: actions/checkout@v2
      - name: Find matching workflow
        uses: SamhammerAG/last-successful-build-action@v1
        with:
          token: "${{ secrets.GITHUB_TOKEN }}"
          branch: "development"
          workflow: "build"
```

## Config

### Action inputs

| Name | Description | Default |
| --- | --- | --- |
| `token` | `GITHUB_TOKEN` or a `repo` scoped [PAT](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token). | `GITHUB_TOKEN` |
| `branch` | Branch for the workflow to look for. | "" |
| `workflow` | Workflow name to look for. | "" |


### Action outputs

| Name | Description | Default |
| --- | --- | --- |
| `sha` | Sha of the workflow-run matching the requirements. | `${{ github.sha }}` |
