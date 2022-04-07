import React, { FC, useEffect, useState, KeyboardEvent } from 'react';
import { connect } from 'react-redux';
import { actions, CardActionTypes } from './action';
import { actions as kanbanActions } from '../action';
import { RootState } from '../../../reducers';
import ReactHotkeys from 'react-hot-keys';
import { genMapDispatchToProp } from '../../../utils';
import {
    Button,
    Col,
    Collapse,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Row,
    Tabs,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import shortid from 'shortid';
import { Card, CardIntegration } from '../type';
import { Markdown } from '../style/Markdown';
import formatMarkdown from './formatMarkdown';
import { EditorContainer } from '../style/editorStyle';
import { addNoteToIssue, fetchGitlabIssue, issueGidBase } from '../../../../main/io/persist';
import { gql } from 'graphql-request';
import { Label } from './CardLabel';
import { GitlabCardForm } from '../../Setting/Integrations';

const { TabPane } = Tabs;
const { Panel } = Collapse;
interface Props extends CardActionTypes {
    visible: boolean;
    onCancel: () => void;
    card?: Card;
    form: any;
    listId: string;
}

interface FormData {
    title: string;
    content: string;
    estimatedTime?: number;
    actualTime?: number;
}

const _CardInDetail: FC<Props> = (props: Props) => {
    console.log('card edit', props);

    const [showMarkdownPreview, setShowMarkdownPreview] = useState(true);
    const [cardContent, setCardContent] = useState('');
    const { card, visible, form, onCancel, listId } = props;
    const isCreating = !card;
    const lastIsCreating = React.useRef<boolean | null>(null);
    const thisIsCreating = visible ? isCreating : lastIsCreating.current ?? isCreating;
    const { getFieldDecorator, setFieldsValue, validateFields, resetFields } = form;

    const [integration, setIntegrationState] = useState(
        card?.integration ?? { profileName: 'default' }
    );

    const setIntegration = (integrationOnOk: CardIntegration) => {
        console.log('setIntegration', integrationOnOk, integration);

        if (card) card.integration = integrationOnOk;
    };

    const onDelete = React.useCallback(() => {
        if (!card) {
            return;
        }

        props.deleteCard(card._id, listId);
        onCancel();
    }, [card?._id, listId, onCancel]);

    const onSave = () => {
        validateFields((err: Error, values: FormData) => {
            if (err) {
                throw err;
            }

            saveValues(values);
            setTimeout(resetFields, 200);
            onCancel();
        });
    };

    // TODO avoid code duplication
    let modalFooter = [
        <Popconfirm
            key="del"
            style={{ minWidth: 300, float: 'left' }}
            placement="topLeft"
            title={'Are you sure?'}
            onConfirm={onDelete}
        >
            <Button style={{ float: 'left' }} type={'danger'} icon={'delete'}>
                Delete
            </Button>
        </Popconfirm>,
        <Popconfirm
            key={`gitlab-${card?._id}-${integration.gid}`}
            style={{ minWidth: 300 }}
            placement="topRight"
            title={<GitlabCardForm {...{ integration, onChange: setIntegrationState }} />}
            onConfirm={() => setIntegration(integration)}
        >
            <Button style={{ marginLeft: 4 }} icon={'gitlab'} shape={'circle-outline'} />
        </Popconfirm>,
        <Button key="save" type="primary" onClick={onSave} icon={'save'}>
            {thisIsCreating ? 'Create' : 'Save'}
        </Button>,
    ];

    useEffect(() => {
        lastIsCreating.current = isCreating;
    }, [isCreating]);

    useEffect(() => {
        if (!visible) {
            return;
        }

        setIsEditingActualTime(false);
        if (card) {
            setIntegrationState(card?.integration ?? { profileName: 'default' });
            console.log('editing existing card', card);
            const getIntegration = async (gid: string) => {
                if (!gid.includes(issueGidBase)) return console.warn('improper issue gid', gid);
                const remoteIssue = await fetchGitlabIssue(gid);
                if (remoteIssue) {
                    console.log('int issue', remoteIssue);
                    if (remoteIssue.labels?.length) card.labels = remoteIssue.labels;
                    setCardContent(remoteIssue.description);
                    setFieldsValue({
                        title: remoteIssue.title,
                        content: remoteIssue.description,
                        estimatedTime: remoteIssue.timeEstimate / 3600 || undefined,
                        actualTime: remoteIssue.totalTimeSpent / 3600 || undefined,
                    });
                }
            };
            if (card?.integration?.gid) {
                void getIntegration(card?.integration?.gid);
            }
            setShowMarkdownPreview(true);
            const time = card.spentTimeInHour.estimated;
            const actual = card.spentTimeInHour.actual;
            setCardContent(card.content);
            setFieldsValue({
                title: card.title,
                content: card.content,
                estimatedTime: time ? time : undefined,
                actualTime: actual ? actual : undefined,
            } as FormData);
        } else {
            setCardContent('');
            setShowMarkdownPreview(false);
            setFieldsValue({
                title: '',
                content: '',
                estimatedTime: undefined,
                actualTime: undefined,
            } as FormData);
        }
        modalFooter = [
            <Popconfirm
                key="del"
                style={{ minWidth: 300, float: 'left' }}
                placement="topLeft"
                title={'Are you sure?'}
                onConfirm={onDelete}
            >
                <Button style={{ float: 'left' }} type={'danger'} icon={'delete'}>
                    Delete
                </Button>
            </Popconfirm>,
            <Popconfirm
                key={`gitlab-${card?._id}-${integration.gid}`}
                style={{ minWidth: 300 }}
                placement="topRight"
                title={<GitlabCardForm {...{ integration, onChange: setIntegrationState }} />}
                onConfirm={() => setIntegration(integration)}
            >
                <Button style={{ marginLeft: 4 }} icon={'gitlab'} shape={'circle-outline'} />
            </Popconfirm>,
            <Button key="save" type="primary" onClick={onSave} icon={'save'}>
                {thisIsCreating ? 'Create' : 'Save'}
            </Button>,
        ];
    }, [card, visible]);

    const [isEditingActualTime, setIsEditingActualTime] = useState(false);
    const onSwitchIsEditing = () => {
        setIsEditingActualTime(!isEditingActualTime);
    };

    const saveValues = (formData?: FormData) => {
        const {
            title = card?.title ?? '',
            content = card?.content ?? '',
            estimatedTime,
            actualTime,
        } = formData ?? {};
        const time = estimatedTime ?? card?.spentTimeInHour.estimated ?? 0;
        content && setCardContent(content);
        if (!card) {
            // Creating
            const _id = shortid.generate();
            props.addCard(_id, listId, title, content);
            props.setEstimatedTime(_id, time);
        } else {
            // Edit
            title && props.renameCard(card._id, title);
            props.setContent(card._id, content, card.labels, card.integration);
            props.setEstimatedTime(card._id, time);
            actualTime && props.setActualTime(card._id, actualTime);
        }
    };

    const onAddSpentTimeToGitlab = async () => {
        if (!integration.gid) return console.warn('no gid to add time to');
        void addNoteToIssue(integration.gid, '/spend 25m\n spent 25m on...');
    };

    const keydownEventHandler = React.useCallback(
        (event: KeyboardEvent<any>) => {
            if (
                (event.ctrlKey || event.altKey || event.shiftKey) &&
                (event.which === 13 || event.keyCode === 13)
            ) {
                onSave();
            } else if (event.keyCode === 27) {
                onCancel();
                event.stopPropagation();
            }
        },
        [onSave, onCancel]
    );

    const onTabChange = React.useCallback((name: string) => {
        if (name === 'edit') {
            setShowMarkdownPreview(false);
        } else {
            validateFields((err: Error, values: FormData) => {
                setCardContent(values.content || '');
                setShowMarkdownPreview(true);
            });
        }
    }, []);

    const labels = props.card?.labels ?? [
        {
            id: 'gid://gitlab/GroupLabel/24250023',
            title: 'orga::default',
            description: 'max 25m estimate',
            color: '#dbbdcf',
            textColor: '#333333',
        },
        {
            id: 'gid://gitlab/GroupLabel/24248541',
            title: 'unscoped label',
            description: '',
            color: '#8fbc8f',
            textColor: '#FFFFFF',
        },
    ];

    return (
        <Modal
            visible={visible}
            title={thisIsCreating ? 'Create a new card' : 'Edit'}
            okText={thisIsCreating ? 'Create' : 'Save'}
            onCancel={onCancel}
            cancelButtonProps={{ style: { display: 'none' } }}
            style={{ minWidth: 300 }}
            width={'60vw'}
            onOk={onSave}
            footer={modalFooter}
            destroyOnClose={true}
        >
            <EditorContainer>
                <Form layout="vertical" onKeyDown={keydownEventHandler}>
                    <Form.Item label="Title">
                        {getFieldDecorator('title', {
                            rules: [
                                { required: true, message: 'Please input the name of the card!' },
                            ],
                        })(<Input placeholder={'Title'} onKeyDown={keydownEventHandler} />)}
                    </Form.Item>

                    <Tabs
                        onChange={onTabChange}
                        type="card"
                        activeKey={showMarkdownPreview ? 'preview' : 'edit'}
                        style={{ marginBottom: 10, minHeight: 120 }}
                    >
                        <TabPane tab="Edit" key="edit">
                            {getFieldDecorator('content')(
                                <TextArea
                                    autoSize={{ minRows: 6 }}
                                    placeholder={'Description'}
                                    onKeyDown={keydownEventHandler}
                                />
                            )}
                        </TabPane>
                        <TabPane tab="Preview" key="preview">
                            <Markdown
                                style={{
                                    padding: '0px 10px',
                                    border: '1px solid rgb(220, 220, 220)',
                                    borderRadius: 4,
                                    maxHeight: 'calc(100vh - 600px)',
                                    minHeight: 120,
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: formatMarkdown(cardContent || ''),
                                }}
                            />
                        </TabPane>
                    </Tabs>
                    <Row>
                        {labels.map((eachLabel) => {
                            const { id: key } = eachLabel;
                            return <Label {...{ key }} {...eachLabel} />;
                        })}
                    </Row>
                    <Row style={{ paddingTop: 18 }}>
                        <Col span={8}>
                            <Form.Item label="Estimated Time In Hour">
                                {getFieldDecorator('estimatedTime')(
                                    <InputNumber
                                        min={0}
                                        max={100}
                                        step={0.5}
                                        precision={1}
                                        placeholder={'Estimated Time In Hour'}
                                    />
                                )}
                            </Form.Item>

                            {thisIsCreating ? undefined : (
                                <Form.Item label="Actual Spent Time In Hour">
                                    {getFieldDecorator('actualTime')(
                                        <InputNumber
                                            disabled={!isEditingActualTime}
                                            precision={2}
                                            min={0}
                                            step={0.2}
                                            placeholder={'Actual Time In Hour'}
                                        />
                                    )}
                                    <Button
                                        style={{ marginLeft: 4 }}
                                        icon={isEditingActualTime ? 'unlock' : 'lock'}
                                        shape={'circle-outline'}
                                        onClick={onSwitchIsEditing}
                                    />
                                    <Button
                                        style={{ marginLeft: 4 }}
                                        icon={'plus'}
                                        shape={'circle-outline'}
                                        onClick={() => onAddSpentTimeToGitlab()}
                                    />
                                </Form.Item>
                            )}
                        </Col>
                        <Col span={14}>
                            {/* <Collapse accordion={true}>
                                <Panel header="Gitlab Integration" key="1Gitlab">
                                    <GitlabCardForm {...{ setIntegration, integration}} />
                                </Panel>
                            </Collapse> */}
                        </Col>
                    </Row>
                    {/* {thisIsCreating ? undefined : (
                        <Row>
                            <Popconfirm title={'Are you sure?'} onConfirm={onDelete}>
                                <Button type={'danger'} icon={'delete'}>
                                    Delete
                                </Button>
                            </Popconfirm>
                        </Row>
                    )} */}
                </Form>
            </EditorContainer>
        </Modal>
    );
};

export const CardInDetail = connect(
    (state: RootState) => {
        const { isEditing, _id, listId } = state.kanban.kanban.editCard;
        return {
            listId,
            card: _id === undefined ? undefined : state.kanban.cards[_id],
            visible: isEditing,
        };
    },
    genMapDispatchToProp<CardActionTypes>({
        ...actions,
        onCancel: () => (dispatch: any) =>
            dispatch(kanbanActions.setEditCard(false, '', undefined)),
    })
)(Form.create({})(_CardInDetail));
