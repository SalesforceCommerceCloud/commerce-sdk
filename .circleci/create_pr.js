const Octokit = require("@octokit/rest");

const opt = {
    OWNER: 0,
    TOKEN: 1,
    HEAD: 2,
    TITLE: 3,
    BODY: 4
};

async function createPullRequest( arguments ) {

    const owner = arguments[opt.OWNER];
    const token = arguments[opt.TOKEN];
    const head = arguments[opt.HEAD];
    const title = arguments[opt.TITLE];
    const body = arguments[opt.BODY];

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

const argumentsFromCircleCiBuild = process.argv.slice(2);

if (argumentsFromCircleCiBuild.length !== 5) {
    console.log("Usage: create_pr.js <<github repository owner>> <<token>> <<head branch name>> <<pull request title>> <<pull request information>>");
    process.exit(1);
}

createPullRequest(argumentsFromCircleCiBuild).then(s => {
    console.log("build-test-and-deploy: Pull request task completed.", s);
}).catch(err => {
    console.log("Error creating pull request", err);
    process.exit(1);
});


