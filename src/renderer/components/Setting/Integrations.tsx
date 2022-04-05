import { Button, Col, Collapse, Form, Input, Row, Select } from 'antd';
import React, { FC, KeyboardEvent, MouseEvent, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { IntegrationInfo } from '../Kanban/type';

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

interface IntegrationsProps extends IntegrationInfo {
    setIntegrations?: any;
}

const GitlabForm: FC<{ tokenRO?: string; tokenRW?: string }> = React.memo(
    ({ tokenRO = '', tokenRW = '' }) => {
        // const [token, settoken] = useState(tokenProp)
        const tokenFieldRO = useRef<Input | null>(null);
        const tokenFieldRW = useRef<Input | null>(null);

        const onTest = (isRw = false) => {
            const tokenField = isRw ? tokenFieldRW : tokenFieldRO;
            const val = tokenField?.current?.input?.value ?? '';
            console.log(isRw, val);
        };
        const onSave = (isRw = false) => {
            const tokenField = isRw ? tokenFieldRW : tokenFieldRO;
            const val = tokenField?.current?.input?.value ?? '';
            console.log(isRw, val);
            // TODO store in localDB
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
                            ref={tokenFieldRO}
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
export const Integrations: FC<IntegrationsProps> = React.memo(({ setIntegrations }) => {
    const integrations = useSelector((state) => {
        console.log(state);
        return state.timer.integrations;
    });
    console.log('integrationProps', setIntegrations, integrations);
    // const { id, title, description, color, textColor } = props;
    // TODO get from redux
    const tokensFromRedux = {
        tokenRW: '',
        tokenRO: 'glpat-eL5ae8EjE5UaSyXp44Q3',
    };
    return (
        <Collapse accordion={true} defaultActiveKey={['1Gitlab']}>
            <Panel header="Gitlab Integration" key="1Gitlab">
                <GitlabForm {...tokensFromRedux} />
            </Panel>
            <Panel header="Google Drive Integration" key="2GoogleDrive">
                <p>TODO...</p>
            </Panel>
        </Collapse>
    );
});
