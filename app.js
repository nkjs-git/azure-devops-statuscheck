const express = require('express')
const app = express()
var bodyParser = require('body-parser')
const vsts = require("azure-devops-node-api")

app.use(bodyParser.json())

app.get('/', function (req, res) {
res.send('Hello World!')
})

const collectionURL = process.env.DEVOPS_URL  
const token = process.env.DEVOPS_TOKEN

var authHandler = vsts.getPersonalAccessTokenHandler(token)
var connection = new vsts.WebApi(collectionURL, authHandler)

app.post('/', function (req, res) {

    console.log(JSON.stringify(req.body))
    var repoId = req.body.resource.repository.id
    var pullRequestId = req.body.resource.pullRequestId
    var title = req.body.resource.title

    // status object to be sent back to PR for updation
    var prStatus = {
        "state": "succeeded",
        "description": "Ready for review",
        "targetUrl": "https://visualstudio.microsoft.com",
        "context": {
            "name": "sonar-status", //name of the status check added in DevOps org
            // "genre": "continuous-integration" //genre of the status check added in DevOps org
        }
    }

    // Check the title to see if there is "WIP" in the title.
    if (title.includes("WIP")) {

        // If so, change the status to pending and change the description.
        prStatus.state = "pending"
        prStatus.description = "Work in progress"
    }

    // Post to Azure DevOps PR to update the status check condition
    connection.getGitApi().then( 
        vstsGit => {                                    
            vstsGit.createPullRequestStatus(prStatus, repoId, pullRequestId).then( result => {
                console.log("createPullRequestStatus result: ", JSON.stringify(result));
            },
            error => {
                console.log(error);
            })
        }, 
        error => { 
            console.log(error);
        } 
    );

    res.send("Received the POST")
})

app.listen(8080, function () {
console.log('Example app listening on port 8080!')
})