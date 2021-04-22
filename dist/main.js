"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const inputs = {
                token: core.getInput("token"),
                branch: core.getInput("branch"),
                workflow: core.getInput("workflow")
            };
            const octokit = github.getOctokit(inputs.token);
            const repository = process.env.GITHUB_REPOSITORY;
            const [owner, repo] = repository.split("/");
            const response = yield octokit.actions.listWorkflowRunsForRepo({ owner, repo, branch: inputs.branch, status: "success" });
            const runs = response.data.workflow_runs
                .filter(r => r.name === inputs.workflow)
                .sort((r1, r2) => new Date(r2.created_at).getTime() - new Date(r1.created_at).getTime());
            let sha = process.env.GITHUB_SHA;
            if (runs.length > 0) {
                const run = runs[0];
                if (sha != run.head_sha) {
                    core.info(`Using extracted sha ${run.head_sha} from run ${run.html_url} instead of triggering sha ${sha}.`);
                    sha = run.head_sha;
                }
            }
            core.setOutput('sha', sha);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
