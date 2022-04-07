import { getIntegrationProfile } from './../../renderer/store/dexie';
import { gql, GraphQLClient } from 'graphql-request';

const gitlabEndpoint = 'https://gitlab.com/api/graphql';

const gitlabKey = 'glpat-eL5ae8EjE5UaSyXp44Q3';
const requestHeaders = (token = gitlabKey) => ({
    authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
});
// const requestHeaders = (token = gitlabKey) => ({
//     headers: {
//         authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//     },
// });
const gqlClient = new GraphQLClient(gitlabEndpoint);
const boardsAndListsForProjectQuery = `query {
	project(fullPath: "onezoomin/lifetime/PomodoroLogger") {
    name
    boards {
      nodes {
        id
        # adding name here throws a complexity error
        lists {
          nodes {
            id
            title
          }
        }
      }
    }
  }
}`;
const issuesForBoardListQuery = `query {
	boardList(id: "gid://gitlab/List/11356792") {
    title
    issues {
      nodes {
        id
        title      
      }
    }
  }
}`;
const boardID = '4026601';
const boardURL = 'https://gitlab.com/onezoomin/lifetime/PomodoroLogger/-/boards/4026601';

// https://docs.gitlab.com/ee/api/graphql/reference/#mutation-type
export const createNoteMutation = gql`
    mutation ($id: NoteableID!, $body: String!) {
        createNote(input: { noteableId: $id, body: $body }) {
            errors
        }
    }
`;

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
export const singleIssueQuery = (issueGID = testIssueGid) => gql`
  query {
      issue(id: "${issueGID}") {
          title
          description
          timeEstimate
          totalTimeSpent
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
    timeEstimate: 0,
    totalTimeSpent: 0,
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

// TODO better ts
export const fetchGitlabIssue = async (
    issueId = testIssueGid
): Promise<undefined | typeof expectedResult> => {
    console.log('querying for issue', issueId);
    const integrationProfile = await getIntegrationProfile('default'); // TODO establish alternate profile system
    const result = await gqlClient.request(
        singleIssueQuery(issueId),
        undefined,
        requestHeaders(integrationProfile?.gitlab?.tokenRO)
    );
    console.log(result);
    if (result?.issue?.id === issueId) {
        // extract labels from nested nodes to top level property: issue.labels
        const retIssue = { ...result.issue, labels: result.issue.labels.nodes };
        console.log(retIssue);
        return retIssue;
    }
    console.warn('non matching result', result);
};

export const addNoteToIssue = async (
    id = testIssueGid,
    body: string
): Promise<void | undefined | typeof expectedResult> => {
    console.log('addingNote for issue', id);
    const integrationProfile = await getIntegrationProfile('default'); // TODO establish alternate profile system
    const tokenRW = integrationProfile?.gitlab?.tokenRW;
    if (!tokenRW) return console.warn('no gitlab RW token found');
    const result = await gqlClient.request(
        createNoteMutation,
        { id, body },
        requestHeaders(tokenRW)
    );
    console.log(result);
    return result;
};
/**
 * notes:
 * https://gitlab.com/-/graphql-explorer
 *
 *
 */
