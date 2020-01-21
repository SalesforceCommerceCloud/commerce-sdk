const Octokit = require("@octokit/rest");

async function createPullRequest( arguments ) {
    if (!Array.isArray(arguments) || arguments.length < 5) {
        throw "Usage: create_pr.js <<token>> <<head branch name>> <<pull request title>> <<pull request information>>";
    }
    const owner = arguments[0];
    const token = arguments[1];
    const head = arguments[2];
    const title = arguments[3];
    const body = arguments[4];

    const octokit = new Octokit({
        auth: token,
        baseUrl: 'https://api.github.com'
    });

    const listOfExistingPullRequests = await octokit.pulls.list( {
        "owner" : owner,
        "repo": "commerce-sdk",
        "head" : owner.concat(":").concat(head),
        "base": "master"
    }).catch(err => {
        console.log("Error getting pull requests for this branch ", head);
        process.exit(1);
    });

    if ( listOfExistingPullRequests
            && Array.isArray(listOfExistingPullRequests.data)
            && listOfExistingPullRequests.data.length > 0) {
        console.log("New pull request not needed, proceed completing the build.");
        return true;
    }

    await octokit.pulls.create({
        "owner" : owner,
        "repo": "circle_npm_integration",
        "title": title,
        "head" : head,
        "base": "master",
        "body": body
    }).then(s => {
        console.log("Pull request created successfully ", s);
    }).catch(err => {
        console.log("Error creating pull request", err);
        process.exit(1);
    });
}

createPullRequest(process.argv.slice([2]));
