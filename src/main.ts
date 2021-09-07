import * as core from '@actions/core'
import * as github from "@actions/github";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let repoShas: string[] | undefined;

const verifyCommit =  async (sha: string): Promise<boolean> => {
    if (!repoShas) {
        try {
            const cmd = `git log --format=format:%H`;
            core.info(`Getting list of SHAs in repo via command "${cmd}"`);

            const { stdout } = await execAsync(cmd);

            repoShas = stdout.trim().split('\n');
        } catch (e) {
            repoShas = [];
            core.warning(`Error while attempting to get list of SHAs: ${e.message}`);

            return false;
        }
    }

    core.info(`Looking for SHA ${sha} in repo SHAs`);

    return repoShas.includes(sha);
}

async function run(): Promise<void> {
    try {
        const inputs = {
            token: core.getInput("token"),
            branch: core.getInput("branch"),
            workflow: core.getInput("workflow"),
            verify: core.getInput('verify')
        };

        const octokit = github.getOctokit(inputs.token);
        const repository: string = process.env.GITHUB_REPOSITORY as string;
        const [owner, repo] = repository.split("/");

        const workflows = await octokit.actions.listRepoWorkflows({ owner, repo });
        const workflowId = workflows.data.workflows.find(w => w.name === inputs.workflow)?.id;

        if (!workflowId) {
            core.setFailed(`No workflow exists with the name "${inputs.workflow}"`);
            return;
        } else {
            core.info(`Discovered workflowId for search: ${workflowId}`);
        }

        const response = await octokit.actions.listWorkflowRuns({ owner, repo, workflow_id: workflowId, per_page: 100 });
        const runs = response.data.workflow_runs
            .filter(x => (!inputs.branch || x.head_branch === inputs.branch) && x.conclusion === "success")
            .sort((r1, r2) => new Date(r2.created_at).getTime() - new Date(r1.created_at).getTime());

        let triggeringSha = process.env.GITHUB_SHA as string;
        let sha: string | undefined = undefined;
        
        if (runs.length > 0) {
            for (const run of runs) {
                core.debug(`This SHA: ${triggeringSha}`);
                core.debug(`Run SHA: ${run.head_sha}`);
                core.debug(`Run Branch: ${run.head_branch}`);
                core.debug(`Wanted branch: ${inputs.branch}`);

                if (triggeringSha != run.head_sha && (!inputs.branch || run.head_branch === inputs.branch)) {
                    if (inputs.verify && !await verifyCommit(run.head_sha)) {
                        core.warning(`Failed to verify commit ${run.head_sha}. Skipping.`);
                        continue;
                    }

                    core.info(
                      inputs.verify
                      ? `Commit ${run.head_sha} from run ${run.html_url} verified as last successful CI run.`
                      : `Using ${run.head_sha} from run ${run.html_url} as last successful CI run.`
                    );
                    sha = run.head_sha;

                    break;
                }
            }
        } else {
            core.info(`No previous runs found for branch ${inputs.branch}.`);
        }

        if (!sha) {
            core.warning("Unable to determine SHA of last successful commit. Using SHA for current commit.");
            sha = triggeringSha;
        }

        core.setOutput('sha', sha);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
