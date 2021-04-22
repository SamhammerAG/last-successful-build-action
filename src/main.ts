import * as core from '@actions/core'
import * as github from "@actions/github";

async function run(): Promise<void> {
    try {
        const inputs = {
            token: core.getInput("token"),
            branch: core.getInput("branch"),
            workflow: core.getInput("workflow")
        };

        const octokit = github.getOctokit(inputs.token);
        const repository: string = process.env.GITHUB_REPOSITORY as string;
        const [owner, repo] = repository.split("/");

        const response = await octokit.actions.listWorkflowRunsForRepo({ owner, repo, branch: inputs.branch, status: "success" });
        const runs = response.data.workflow_runs
            .filter(r => r.name === inputs.workflow)
            .sort((r1, r2) => new Date(r2.created_at).getTime() - new Date(r1.created_at).getTime());

        let sha = process.env.GITHUB_SHA as string;
        
        if (runs.length > 0) {
            const run = runs[0];

            if (sha != run.head_sha) {
                core.info(`Using extracted sha ${run.head_sha} from run ${run.html_url} instead of triggering sha ${sha}.`);
                sha = run.head_sha;
            }
        }

        core.setOutput('sha', sha);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
