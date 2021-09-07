# last-successful-build-action

This action searches for the last successful workflow-run for the given workflow-name and branch. 
The `sha` of the workflow-commit is set as output-parameter. If no matching workflow exists, the `sha` of the current run is emitted.

## Usage

```yml
      - uses: actions/checkout@v2
      - name: Find matching workflow
        uses: SamhammerAG/last-successful-build-action@v2
        with:
          token: "${{ secrets.GITHUB_TOKEN }}"
          branch: "development"
          workflow: "build"
```

## Verifying workflow run SHAs
If your workflow runs are expected to contain no-longer existing commit SHAs (e.g. when squashing and force pushing) you need to verify the SHA of the workflow run commit against the list of commit SHAs in your repository.

```yml
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0 # check out the entire repo history for SHA verification
      - name: Find matching workflow
        uses: SamhammerAG/last-successful-build-action@v2
        with:
          branch: "development"
          workflow: "build"
          verify: true
```

## Config
### Action inputs

| Name | Description | Default |
| --- | --- | --- |
| `token` | `GITHUB_TOKEN` or a `repo` scoped [PAT](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token). | `GITHUB_TOKEN` |
| `branch` | Branch for the workflow to look for. | "" |
| `workflow` | Workflow name to look for. | "" |
| `verify` | Verify workflow commit SHA against list of SHAs in repository | `false` |


### Action outputs

| Name | Description | Default |
| --- | --- | --- |
| `sha` | Sha of the workflow-run matching the requirements. | `${{ github.sha }}` |
