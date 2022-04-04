import { gql, GraphQLClient } from 'graphql-request';

const gitlabEndpoint = 'https://gitlab.com/api/graphql';

const gitlabKey = 'glpat-eL5ae8EjE5UaSyXp44Q3';
const requestHeaders = {
    headers: {
        authorization: `Bearer ${gitlabKey}`,
        'Content-Type': 'application/json',
    },
};
const gqlClient = new GraphQLClient(gitlabEndpoint, requestHeaders);
const boardsForProjectQuery = `query {
  project(fullPath: "onezoomin/lifetime/PomodoroLogger") {
    name
    forksCount
    statistics {
      wikiSize
    }
    issuesEnabled
    boards {
      nodes {
        id
        name
      }
    }
  }
}`;
const boardID = '4026601';
const boardURL = 'https://gitlab.com/onezoomin/lifetime/PomodoroLogger/-/boards/4026601';

const issuesForProjectQuery = `{
  project(fullPath: "onezoomin/lifetime/PomodoroLogger") {
    issues {
      nodes {
        title
        description
        id
        iid
        labels {
          nodes{
            title
            id
          }
        }
        webUrl
      }
    }
  }
}`;
const testIssueResponse = `{
  "title": "Persistence Gitlab POC",
  "description": "- [ ] wire up graphql hardcoded \n- [ ] fetch single issue\n- [ ] update single issue",
  "id": "gid://gitlab/Issue/104756587",
  "iid": "3",
  "labels": {
    "nodes": [
      {
        "title": "orga::quickie",
        "id": "gid://gitlab/GroupLabel/24250023",
        "description": "max 25m estimate",
        "color": "#dbbdcf",
        "textColor": "#333333"
      },
      {
        "title": "stage::doing",
        "id": "gid://gitlab/GroupLabel/24248541",
        "description": "",
        "color": "#8fbc8f",
        "textColor": "#FFFFFF"
      }
    ]
  },
  "webUrl": "https://gitlab.com/onezoomin/lifetime/PomodoroLogger/-/issues/3"
}`;
export const singleIssueQuery = gql`
    query {
        issue(id: "gid://gitlab/Issue/104756587") {
            title
            description
            id
            iid
            labels {
                nodes {
                    id
                    title
                    description
                    color
                    textColor
                }
            }
            webUrl
        }
    }
`;
export const testIssueGid = 'gid://gitlab/Issue/104756587';
export const testLocalCardId = 'bPpumIyi_';

const expectedResult = {
    description:
        '- [ ] wire up graphql hardcoded \n- [ ] fetch single issue\n- [ ] update single issue',
    id: 'gid://gitlab/Issue/104756587',
    iid: '3',
    labels: [
        {
            id: 'gid://gitlab/GroupLabel/24250023',
            title: 'orga::quickie',
            description: 'max 25m estimate',
            color: '#dbbdcf',
            textColor: '#333333',
        },
        {
            id: 'gid://gitlab/GroupLabel/24248541',
            title: 'stage::doing',
            description: '',
            color: '#8fbc8f',
            textColor: '#FFFFFF',
        },
    ],
    title: 'Persistence Gitlab POC',
    webUrl: 'https://gitlab.com/onezoomin/lifetime/PomodoroLogger/-/issues/3',
};

export const fetchGitlabIssue = async (
    issueId = testIssueGid
): Promise<undefined | typeof expectedResult> => {
    console.log('querying for issue', issueId);

    const result = await gqlClient.request(singleIssueQuery);
    console.log(result);
    if (result?.issue?.id === issueId) {
        const retIssue = { ...result.issue, labels: result.issue.labels.nodes };
        console.log(retIssue);
        return retIssue;
    }
    console.warn('non matching result', result);
};
/**
 * notes:
 * https://gitlab.com/-/graphql-explorer
 *
 *
 */
