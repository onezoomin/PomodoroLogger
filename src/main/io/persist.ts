import { gql } from 'graphql-request';

const gitlabKey = 'glpat-eL5ae8EjE5UaSyXp44Q3';
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
        "id": "gid://gitlab/GroupLabel/24250023"
      },
      {
        "title": "stage::doing",
        "id": "gid://gitlab/GroupLabel/24248541"
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
                    title
                    id
                }
            }
            webUrl
        }
    }
`;
export const testIssueGid = 'gid://gitlab/Issue/104756587';
export const testLocalCardId = 'bPpumIyi_';

/**
 * notes:
 * https://gitlab.com/-/graphql-explorer
 *
 *
 */
