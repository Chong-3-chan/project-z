import React, { Fragment, useCallback, useEffect, useReducer, useRef, useState } from "react";
import { dataAssign } from "../class/data-controller";
import { argsStr_to_arr, chara_map, file_map, s } from "../data/extra-test-data";
import { classNames } from "../main";
const positionList = ['a_1', 'a_2', 'a_3', 'b_1', 'b_2', 'b_3'];
const outStyleList = ['default'];
const moveStyleList = ['default'];
const rm_0 = {
    "aChoice": {
        length: { max: 3, min: 3 }, sequence: [
            ["optionText", "text"],
            ["jumpParaId", "select", (data, story) => Object.keys(story.para).map((e, i) => [e, `段落${e}(第${i + 1}段)`])],
            ["setTo", "select", (data, story, bookId, bookStoryTree) =>
                [
                    ...Object.keys(s[bookId]).filter(e=>!(e in bookStoryTree)),
                    ...Object.keys(bookStoryTree).filter(e => !bookStoryTree[e].child.has(story.id)),
                    ...Object.keys(dataAssign.s[bookId] ?? {}).filter(e => dataAssign.s[bookId][e]),
                ].map(e => [e])
            ]
        ]
    },
}, rm_1 = {
    "chara": {
        length: { max: 3, min: 3 }, sequence: [
            ["charaId", "select", () => [...Object.entries(dataAssign.chara_map).filter(e => e[1]).map(([k, v]) => [k, v.name]), ...Object.entries(chara_map).map(([k, v]) => [k, v.name + `(${k})`])]],
            ["picId", "select", (data) => data["charaId"] ? Object.entries((chara_map[data["charaId"]] ?? dataAssign.chara_map[data["charaId"]])?.pic).map(([k, v]) => [k, v + '(' + k + ')']) : undefined],
            ["position", "select", () => positionList.map(e => [e])]
        ]
    },
    "charaOut": {
        length: { max: 7, min: 2 }, sequence: [
            ["outStyle", "select", () => outStyleList.map(e => [e])],
            ["charaId", "select", () => [...Object.entries(dataAssign.chara_map).filter(e => e[1]).map(([k, v]) => [k, v.name]), ...Object.entries(chara_map).map(([k, v]) => [k, v.name + `(${k})`])], true],
        ]
    },
    "charaMove": {
        length: { max: 7, min: 2 }, sequence: [
            ["moveStyle", "select", () => moveStyleList.map(e => [e])],
            ["charaId", "select", () => [...Object.entries(dataAssign.chara_map).filter(e => e[1]).map(([k, v]) => [k, v.name]), ...Object.entries(chara_map).map(([k, v]) => [k, v.name + `(${k})`])], true],
        ]
    },
    "setPlace": {
        length: { max: 1, min: 1 }, sequence: [
            ["fileKey", "select", () => Object.keys(file_map).filter(e => file_map[e].packageKey.startsWith('place'))
                .concat(Object.keys(dataAssign.file_map).filter(e => dataAssign.file_map[e].packageKey.startsWith('place'))).map((e) => [e])],
        ]
    },
    "choice": {
        length: { max: 5, min: 1 }, sequence: [
            ["optionData", "array", "aChoice", true]
        ]
    },
    "CG": {
        length: { max: 1, min: 1 }, sequence: [
            ["fileKey", "select", () => Object.keys(file_map).filter(e => file_map[e].packageKey.startsWith('CG'))
                .concat(Object.keys(dataAssign.file_map).filter(e => dataAssign.file_map[e].packageKey.startsWith('CG'))).map((e) => [e])],
        ]
    },
    "CGOut": {
        length: { max: 0, min: 0 }, sequence: []
    },
    "BGM": {
        length: { max: 1, min: 1 }, sequence: [
            ["fileKey", "select", () => Object.keys(file_map).filter(e => file_map[e].packageKey.startsWith('BGM'))
                .concat(Object.keys(dataAssign.file_map).filter(e => dataAssign.file_map[e].packageKey.startsWith('BGM'))).map((e) => [e])],
        ]
    },
    "voice": {
        length: { max: 1, min: 1 }, sequence: [
            ["fileKey", "select", () => Object.keys(file_map).filter(e => file_map[e].packageKey.startsWith('voice'))
                .concat(Object.keys(dataAssign.file_map).filter(e => dataAssign.file_map[e].packageKey.startsWith('voice'))).map((e) => [e])],
        ]
    },
},
    rm_2 = {
        "fn": {
            length: { max: 15, min: 0 }, sequence: [
                ["functionProps", "any_array", Object.keys(rm_1), true]
            ]
        },
    };

const sentence_function_rule_map = {
    ...rm_0, ...rm_1, ...rm_2
}
function arrr(maxl, minl, arr = [], functionName, value = []) {
    if (arr.length > maxl) return arr.slice(0, maxl);
    let minl_ = Math.min(maxl, Math.max(value.length, minl));
    if (arr.length < minl_) {
        return [...arr,
        ...sentence_function_rule_map[functionName].sequence.slice(arr.length, minl_)
            .map((rule) => {
                return { rule, value: "" }
            }),
        ...(sentence_function_rule_map[functionName].sequence.length < minl_ ? new Array(minl_ - sentence_function_rule_map[functionName].sequence.length).fill(sentence_function_rule_map[functionName].sequence[sentence_function_rule_map[functionName].sequence.length - 1]) : []).map((rule) => {
            return { rule, value: "" }
        }),
        ].map((obj, i) => ({ ...obj, value: value[i] }));
    }
    return [...arr];
}
function SentenceFunctionInput({ fnList, functionName, story, onChange, isRoot, value, bookId, bookStoryTree }) {
    // debugger;
    const { length: { max: maxl, min: minl }, sequence } = sentence_function_rule_map[functionName];
    const [, forceUpdate] = useReducer(e => e + 1, 0);
    const [inputs, setInputs] = useState(arrr(maxl, minl,
        fnList?.map(e => {
            const [functionName, args] = [e.slice(0, e.indexOf('[')), argsStr_to_arr(e.slice(e.indexOf('[') + 1, e.lastIndexOf(']')))];
            const obj = {
                rule: ['Function:' + functionName, 'array', functionName, true],
                value: args
            }
            return obj;
        })
        , functionName, value));
    const getLastRule = useCallback(() => sequence[inputs.length] ?? sequence[sequence.length - 1], [sequence, inputs]);
    const [getNewFunctionName, setNextFunctionName] = ((e) => [() => e.current, (value) => e.current = value])(useRef());
    const [getNewIdentifier] = ((e) => [() => e.current++])(useRef(0));
    const [getDeleteForceIdentifier, setDeleteForceIdentifier] = ((e) => [() => e.current, (value) => e.current = value])(useRef(null));
    useEffect(() => { setNextFunctionName() }, [getLastRule()])
    const getPropsObj = useCallback(() => {
        const obj = {};
        inputs.map(({ rule: [name, , , multiple], value }, i) => {
            multiple ? ((obj[name] ?? (obj[name] = [])).push(value)) : obj[name] = value;
        })
        return obj;
    }, [inputs]);
    const getPropsArr = useCallback(() => {
        const arr = inputs.map(({ rule: [name, , , multiple], value }, i) => value);
        return arr;
    }, [inputs]);
    useEffect(() => {
        onChange({ arr: getPropsArr(), obj: getPropsObj() });
        console.log(inputs, "inputs");
    }, [inputs])
    const handleAddInput = () => {
        if (inputs.length >= maxl) setInputs(arrr(maxl, minl, inputs));
        else {
            const nextChlid = { rule: [...getLastRule()] };
            if (nextChlid.rule[1] == "any_array") {
                if (!getNewFunctionName()) return;
                nextChlid.rule[0] = `Function:` + getNewFunctionName()
                nextChlid.rule[1] = "array";
                nextChlid.rule[2] = getNewFunctionName();
            }
            setInputs([...inputs, nextChlid]);
        }
    };

    const handleRemoveInput = (index) => {
        if (!inputs[index].rule[3]) return;
        if (inputs.length <= minl) setInputs(arrr(maxl, minl, inputs, functionName));
        else {
            const newInputs = [...inputs];
            newInputs.splice(index, 1);
            setInputs(newInputs);
        }
    };

    const handleConfirm = () => {
        console.log(getPropsObj(), getPropsArr(), inputs);
    };
    const any_array_functionNameSelect = useCallback(() => {
        if (getLastRule()?.[1] == "any_array") {
            return (<select name="any_array_functionNameSelect" onChange={e => setNextFunctionName(e.target.value)}>
                {<option key={-1} value={""}>{`--选择函数--`}</option>}
                {getLastRule()[2].map((e, i) => <option value={e} key={i}>{e}</option>)}
            </select>)
        }
        else return <></>
    }, [getLastRule(), getNewFunctionName, setNextFunctionName])
    return (
        <div className={classNames("sentence-function-input", isRoot && "root")}>
            {any_array_functionNameSelect()}
            {maxl != minl && <a onClick={handleAddInput}>{`追加${getLastRule()[1] == "any_array" ? "函数" : "参数"}`}</a>}
            {/* {getLastRule()?.[1] == "any_array" && <select onChange={e => setNextFunctionName(e.target.value)}>
          {getLastRule()[2].map((e, i) => <option value={e} key={i}>{e}</option>)}
        </select>} */}
            {inputs.map((data, i) => {
                const { rule: [name, type, fn] } = inputs[i];
                const identifier = (inputs[i].identifier ?? (inputs[i].identifier = getNewIdentifier()));
                // debugger;
                switch (type) {
                    case "text":
                        data.value ?? (data.value = "");
                        return (<div key={identifier} className={getDeleteForceIdentifier() == identifier ? "delete-force" : ""}>
                            {name} :
                            <input type={type} value={data.value} onChange={(e) => {
                                data.value = e.target.value;
                                onChange({ arr: getPropsArr(), obj: getPropsObj() });
                                forceUpdate();
                            }} />
                            {maxl != minl && <a className={inputs.length < minl ? `disable` : ``} onClick={() => handleRemoveInput(i)}
                                onMouseEnter={() => {
                                    setDeleteForceIdentifier(identifier);
                                    forceUpdate();
                                }}
                                onMouseLeave={() => {
                                    getDeleteForceIdentifier() == identifier && setDeleteForceIdentifier(null);
                                    forceUpdate();
                                }}
                            >{`删除参数${name}`}</a>}
                        </div>)
                    case "select":
                        const options = ((data.options = fn(getPropsObj(), story, bookId, bookStoryTree))) ?? [];
                        // data.value ?? (data.value="");
                        return (<div key={identifier} className={getDeleteForceIdentifier() == identifier ? "delete-force" : ""}>
                            {name} :
                            {<select name="name" onChange={(e) => {
                                data.value = e.target.value;
                                onChange({ arr: getPropsArr(), obj: getPropsObj() });
                                forceUpdate();
                            }} value={data.value}>
                                {<option key={-1} value={""}></option>}
                                {options.map(([v, n], ii) => <option key={ii} value={v}>{n ?? v}</option>)}
                            </select>}
                            {maxl != minl && <a className={inputs.length < minl ? `disable` : ``} onClick={() => handleRemoveInput(i)}
                                onMouseEnter={() => {
                                    setDeleteForceIdentifier(identifier);
                                    forceUpdate();
                                }}
                                onMouseLeave={() => {
                                    getDeleteForceIdentifier() == identifier && setDeleteForceIdentifier(null);
                                    forceUpdate();
                                }}>{`删除参数${name}`}</a>}
                        </div>)
                    case "array":
                        data.value ?? (data.value = []);
                        return (<div key={identifier} className={getDeleteForceIdentifier() == identifier ? "delete-force" : ""}>
                            {name} :
                            <SentenceFunctionInput functionName={fn} story={story} onChange={({ arr, obj }) => {
                                data.value = arr;
                                onChange({ arr: getPropsArr(), obj: getPropsObj() });
                                // forceUpdate();
                            }} value={data.value} bookId={bookId} bookStoryTree={bookStoryTree}></SentenceFunctionInput>
                            {maxl != minl && <a onClick={() => handleRemoveInput(i)}
                                onMouseEnter={() => {
                                    setDeleteForceIdentifier(identifier);
                                    forceUpdate();
                                }}
                                onMouseLeave={() => {
                                    getDeleteForceIdentifier() == identifier && setDeleteForceIdentifier(null);
                                    forceUpdate();
                                }}>{`删除函数${name}`}</a>}
                        </div>)
                    default:
                        return <Fragment key={identifier}></Fragment>
                        break;
                }
            })}
            {isRoot && <a onClick={handleConfirm}>确定</a>}
        </div>
    );
}
export default SentenceFunctionInput;