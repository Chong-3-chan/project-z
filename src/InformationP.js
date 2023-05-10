import React, { useState, useEffect, useRef, useContext, Fragment } from 'react'
import { pageContext, visitable_information_key_list } from './App';
import './InformationP.css'
import { DBgetAll, DBput } from './tools/IndexedDB-controller';
import { getFileSrc, information_map, wait } from './data/extra-test-data';
import { homeResource_map } from './HomeP';
function InformationP() {
    const { pageAction: action, pageState } = useContext(pageContext);
    const [selected, setSelected] = useState(null);
    const visitableInformation = visitable_information_key_list.map(e => information_map[e]);
    useEffect(() => {

    }, [])
    return <div className='InformationP' style={{ backgroundImage: `url(${getFileSrc(homeResource_map.backgroundImage)})` }}>
        <div className='info-title-list'>
            {visitableInformation.map(({ title, id }) => <div className={`info-title ${selected == id ? "selected" : ""}`} key={id} onClick={() => setSelected(id)}>{title}</div>)}
        </div>
        <div className='info-read'>
            {selected && <>
                <div className='title'>{information_map[selected]?.title}</div>
                {selected && information_map[selected].data.map((info, i) => {
                    const type = info.type;
                    switch (type) {
                        case "pic":
                            return <div className='pic' key={i}>
                                <img src={getFileSrc(info.fileKey)}></img>
                            </div>
                        case "text":
                            return <div className='text' key={i}>{info.text.split('\n').map((l, j) => <p key={j}>{l}</p>)}</div>
                        default:
                            return <Fragment key={i}></Fragment>
                    }
                })}
            </>}
        </div>
        <div className='fixed-buttons-bar'>
            <div className='home' onClick={() => action.setActivePage("home")}></div>
        </div>
    </div>
}

export default InformationP;