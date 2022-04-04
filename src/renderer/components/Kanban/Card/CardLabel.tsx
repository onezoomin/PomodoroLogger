import { ipcRenderer } from 'electron';
import React, { FC } from 'react';
import styled from 'styled-components';
import { Label as LabelType } from '../type';

/**
 * If you're using z-index, make sure the element has a defined position attribute or it won't work.
 * Wherever you use z-index in your css, define the position of that element. (Absolute, relative, inherit...)
 * https://stackoverflow.com/a/23067835/8169341
 */
const CardLabel = styled.div.attrs((props: LabelType) => ({
    backgroundColor: props.color || 'grey',
    color: props.textColor || 'white',
}))`
    --label-inset-border: inset 0 0 0 2px ${(props) => props.backgroundColor};
    background-color: ${(props) => props.backgroundColor};
    color: ${(props) => props.color};
    position: relative;
    padding: 0.2rem;
    display: inline-flex;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: top;
    white-space: nowrap;
    max-width: 100%;
    border-radius: 0.8rem;
    margin: 0.1rem;
    font-size: 0.8rem;
    box-shadow: var(--label-inset-border) !important;
    .scoped-scope {
        padding: 0 0.2rem;
    }
    .scoped-label {
        background-color: #fff;
        border-radius: 0 0.6rem 0.6rem 0;
        padding: 0 0.2rem;
        color: ${(props) => props.backgroundColor};
    }
`;

interface CardLabelProps extends LabelType {
    parentId?: string;
}

export const Label: FC<CardLabelProps> = React.memo((props: CardLabelProps) => {
    const { id, title, description, color, textColor } = props;
    let [labelScope, labelTitle, ...extraScope] = title.split('::');
    if (extraScope.length) {
        labelTitle = `${labelTitle}::${extraScope.join('::')}`;
        labelScope = labelScope + '';
        extraScope = [...extraScope];
    }
    return (
        <CardLabel
            {...{ id, color, textColor }}
            onMouseUp={(e) => {
                console.log(e.nativeEvent);
            }}
        >
            <div className="scoped-scope">{labelScope}</div>
            {!labelTitle ? null : <div className="scoped-label">{labelTitle}</div>}
        </CardLabel>
    );
});
