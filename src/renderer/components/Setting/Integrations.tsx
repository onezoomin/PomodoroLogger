import { Button, Col, Collapse, Form, Icon, Input, Row, Select, Switch, Tooltip } from 'antd';
import { useLiveQuery } from 'dexie-react-hooks';
import M from 'minimatch';
import React, { FC, KeyboardEvent, MouseEvent, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { issueGidBase, addNoteToIssue, getTokenRW } from '../../../main/io/persist';
import { integrationsQuery, updateIntegration } from '../../store/dexie';
import { CardIntegration, IntegrationInfo } from '../Kanban/type';

const { Panel } = Collapse;
const { Option } = Select;
/**
 * If you're using z-index, make sure the element has a defined position attribute or it won't work.
 * Wherever you use z-index in your css, define the position of that element. (Absolute, relative, inherit...)
 * https://stackoverflow.com/a/23067835/8169341
 */
// const Integrations = styled.div.attrs((props: IntegrationInfo) => ({
//     backgroundColor: props.color || 'grey',
//     color: props.textColor || 'white',
// }))`
//     --label-inset-border: inset 0 0 0 2px ${(props) => props.backgroundColor};
//     background-color: ${(props) => props.backgroundColor};
//     color: ${(props) => props.color};
//     position: relative;
//     padding: 0.2rem;
//     display: inline-flex;
//     overflow: hidden;
//     text-overflow: ellipsis;
//     vertical-align: top;
//     white-space: nowrap;
//     max-width: 100%;
//     border-radius: 0.8rem;
//     margin: 0.1rem;
//     font-size: 0.8rem;
//     box-shadow: var(--label-inset-border) !important;
//     .scoped-scope {
//         padding: 0 0.2rem;
//     }
//     .scoped-label {
//         background-color: #fff;
//         border-radius: 0 0.6rem 0.6rem 0;
//         padding: 0 0.2rem;
//         color: ${(props) => props.backgroundColor};
//     }
// `;
interface GitlabCardFormProps {
    integration: CardIntegration;
    setIntegration?: (i: CardIntegration) => void;
    onChange?: React.Dispatch<React.SetStateAction<CardIntegration>>;
}
export const GitlabCardForm: FC<GitlabCardFormProps> = ({
    setIntegration,
    onChange,
    integration,
}) => {
    // const [token, settoken] = useState(tokenProp)
    const gidField = useRef<Input | null>(null);

    const { gid: gidProp, profileName = 'default' } = integration;
    console.log('render glCard', integration);

    const onTest = async () => {
        const gid = gidField?.current?.input?.value || gidProp;
        console.log('test', gid);
        // TODO add ui for test results for both RO and RW
        const isRWtokenAvailable = await getTokenRW();
        if (gid?.includes(issueGidBase) && isRWtokenAvailable) {
            void addNoteToIssue(gid, '/spend 25m\n spent 25m on...');
            // await results and give feedback about RW test results
        }
    };
    const onSave = () => {
        const gid = gidField?.current?.input?.value || gidProp;
        const updateVal: CardIntegration = {
            profileName,
            gid,
        };
        console.log('save', updateVal);
        setIntegration && setIntegration(updateVal);
    };
    const saveOnEnter = (kEv: KeyboardEvent) => {
        // console.log(kEv, kEv.key);
        if (kEv.key === 'Enter') onSave();
    };
    const inputChangeHandler = (cEv: React.ChangeEvent<HTMLElement>) => {
        // cEv.persist()
        const gid = (cEv.nativeEvent.target as HTMLInputElement).value || '';
        // console.log(cEv, gid);
        if (onChange) {
            const updateVal: CardIntegration = {
                profileName,
                gid,
            };
            console.log('onChage', updateVal);
            onChange(updateVal);
        }
    };

    return (
        <div>
            <Row style={{ margin: 6, minWidth: 400 }}>
                <Col span={4} style={{ marginTop: 4, whiteSpace: 'nowrap' }}>
                    issue gid:
                </Col>
                <Col span={16} style={{ paddingRight: 4 }}>
                    <Input
                        type="text"
                        ref={gidField}
                        onKeyDown={(kEv: KeyboardEvent) => {
                            saveOnEnter(kEv);
                        }}
                        onChange={inputChangeHandler}
                        placeholder={gidProp || 'Enter Gitlab Issue GID'}
                    />
                </Col>
                <Col span={4}>
                    <Button htmlType="submit" onClick={() => onTest()}>
                        Test
                    </Button>
                    {setIntegration && (
                        <Button
                            style={{ marginLeft: 4 }}
                            type="primary"
                            htmlType="submit"
                            onClick={() => onSave()}
                        >
                            Save
                        </Button>
                    )}
                </Col>
            </Row>
            <Row style={{ margin: 6, minWidth: 400 }}>
                <Col span={6} style={{ marginTop: 4, padding: 3, whiteSpace: 'nowrap' }}>
                    "Pull" Only:
                </Col>
                <Col span={8} style={{ padding: 6 }}>
                    <Tooltip
                        title={
                            'For now, only downstream syncing from gitlab is possible. \n\nEdit the issue content in gitlab, and use Pomodoro Logger to track time.'
                        }
                    >
                        <Switch
                            checkedChildren={<Icon type="download" />}
                            unCheckedChildren={<Icon type="sync" />}
                            defaultChecked={true}
                            disabled={true}
                        />
                    </Tooltip>
                </Col>
            </Row>
        </div>
    );
};

const GitlabTokensForm: FC<{ tokenRO?: string; tokenRW?: string }> = React.memo(
    ({ tokenRO = '', tokenRW = '' }) => {
        // const [token, settoken] = useState(tokenProp)
        const tokenFieldRO = useRef<Input | null>(null);
        const tokenFieldRW = useRef<Input | null>(null);

        const onTest = (isRw = false) => {
            const val = isRw
                ? tokenFieldRW?.current?.input?.value || tokenRW
                : tokenFieldRO?.current?.input?.value || tokenRO;
            console.log(isRw, val);
            // TODO test a query or mutation
        };
        const onSave = (isRw = false) => {
            const tokenField = isRw ? tokenFieldRW : tokenFieldRO;
            const valRO = tokenFieldRO?.current?.input?.value || tokenRO;
            const valRW = tokenFieldRW?.current?.input?.value || tokenRW;
            console.log(isRw ? valRW : valRO);
            // TODO store in localDB
            const updateVal: IntegrationInfo = {
                profileName: 'default',
                gitlab: {
                    tokenRO: valRO,
                    tokenRW: valRW,
                },
            };
            updateIntegration(updateVal);
        };
        const saveOnEnter = (kEv: KeyboardEvent, isRw = false) => {
            console.log(kEv, kEv.key);
            if (kEv.key === 'Enter') onSave(isRw);
        };

        return (
            <div>
                <Row>
                    <Col span={2} style={{ marginTop: 4 }}>
                        ReadOnly:
                    </Col>
                    <Col span={8} style={{ marginRight: 4 }}>
                        <Input
                            type="text"
                            ref={tokenFieldRO}
                            onKeyDown={(kEv: KeyboardEvent) => {
                                saveOnEnter(kEv);
                            }}
                            placeholder={tokenRO || 'Enter Gitlab ReadOnly Token'}
                        />
                    </Col>
                    <Col span={4}>
                        <Button
                            style={{ marginRight: 4 }}
                            htmlType="submit"
                            onClick={() => onTest()}
                        >
                            Test
                        </Button>
                        <Button type="primary" htmlType="submit" onClick={() => onSave()}>
                            Save
                        </Button>
                    </Col>
                </Row>
                <Row style={{ marginTop: 4 }}>
                    <Col span={2} style={{ marginTop: 4 }}>
                        ReadWrite:
                    </Col>
                    <Col span={8} style={{ marginRight: 4 }}>
                        <Input
                            type="text"
                            ref={tokenFieldRW}
                            onKeyDown={(kEv: KeyboardEvent) => {
                                saveOnEnter(kEv, true);
                            }}
                            placeholder={tokenRW || 'Enter Gitlab ReadWrite Token'}
                        />
                    </Col>
                    <Col span={4}>
                        <Button
                            style={{ marginRight: 4 }}
                            htmlType="submit"
                            onClick={() => onTest(true)}
                        >
                            Test
                        </Button>
                        <Button type="primary" htmlType="submit" onClick={() => onSave(true)}>
                            Save
                        </Button>
                    </Col>
                </Row>
            </div>
        );
    }
);
export const Integrations: FC = React.memo(() => {
    const integrations = useLiveQuery(integrationsQuery) ?? [];

    const tokensFromDexie = integrations[0]?.gitlab ?? {
        tokenRW: 'defaultTokenRW',
        tokenRO: 'defaultTokenRO',
    };
    console.log('integrations', integrations, tokensFromDexie);
    return (
        <Collapse accordion={true} defaultActiveKey={['1Gitlab']}>
            <Panel header="Gitlab Integration" key="1Gitlab">
                <GitlabTokensForm {...tokensFromDexie} />
            </Panel>
            <Panel header="Google Drive Integration" key="2GoogleDrive">
                <p>TODO...</p>
            </Panel>
        </Collapse>
    );
});
