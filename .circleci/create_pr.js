const Octokit = require("@octokit/rest");

async function createPullRequest() {

    const owner = process.env.GITHUB_OAUTH_TOKEN_OWNER;
    const token = process.env.GITHUB_OAUTH_TOKEN;
    const head = process.env.CIRCLE_BRANCH;
    const title = "Publish to npm";
    const body = "Published commerce_sdk to npm";

    const octokit = new Octokit({
        auth: token,
        baseUrl: 'https://api.github.com'
    });

    try{
        const listOfExistingPullRequests = await octokit.pulls.list( {
            "owner" : owner,
            "repo": "commerce-sdk",
            "head" : owner.concat(":").concat(head),
            "base": "master"
        });
        if ( listOfExistingPullRequests
            && Array.isArray(listOfExistingPullRequests.data)
            && listOfExistingPullRequests.data.length > 0) {
            console.log("New pull request not needed, proceed completing the build.");
            return true;
        }
    }catch (err) {
        console.log("Error getting pull requests for this branch ", head, err);
        process.exit(1);
    }

    return octokit.pulls.create({
        "owner" : owner,
        "repo": "commerce-sdk",
        "title": title,
        "head" : head,
        "base": "master",
        "body": body
    });
}

createPullRequest().then(s => {
    console.log("build-test-and-deploy: Pull request task completed.", s);
}).catch(err => {
    console.log("Error creating pull request", err);
    process.exit(1);
});


