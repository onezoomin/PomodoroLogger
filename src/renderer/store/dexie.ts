import { IntegrationInfo } from './../components/Kanban/type.d';
// import { Integrations } from './../components/Setting/Integrations';
import { Dexie, Table } from 'dexie';

export class SettingsDB extends Dexie {
    public Integrations!: Table<IntegrationInfo, string>; // string = type of the priKey
}

export const settingsDB = new SettingsDB('PomLog_Settings');
settingsDB.version(1).stores({
    Integrations: 'profileName',
});
settingsDB.on('populate', () => {
    settingsDB.Integrations.add({
        profileName: 'default',
        gitlab: {
            tokenRW: '',
            tokenRO: 'glpat-eL5ae8EjE5UaSyXp44Q3',
        },
    });
});
export const integrationsQuery = () => settingsDB.Integrations.toArray();
export const updateIntegration = async (recordToPut: IntegrationInfo) =>
    await settingsDB.Integrations.put(recordToPut);
export const getIntegrationProfile = async (profileName: string) =>
    await settingsDB.Integrations.get(profileName);
