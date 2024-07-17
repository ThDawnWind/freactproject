import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types'

import Spinner from '../spinner/Spinner';
import ErrorMessage from '../errorMessage/ErrorMessage';
import useMarvelService from '../../services/MarvelService';
import { Transition, TransitionGroup } from 'react-transition-group';
import './charList.scss';

const CharList = (props) => {

    const [charList, setCharList] = useState([]);
    const [newItemLoading, setNewItemLoading] = useState(false);
    const [offset, setOffset] = useState(210);
    const [charEnded, setCharEnded] = useState(false);
    const [animStart, setAnimStart] = useState(false);

    const { loading, error, getAllCharacters } = useMarvelService();

    useEffect(() => {
        onRequest(offset, true);
    }, [])

    const onRequest = (offset, initial) => {
        initial ? setNewItemLoading(false) : setNewItemLoading(true);
        getAllCharacters(offset)
            .then(onCharListLoaded)
    }

    const onCharListLoaded = async (newCharList) => {

        const { logger, secLogger } = await import('./someFunk');
        logger();
        secLogger();

        let ended = false;
        if (newCharList.length < 9) {
            ended = true;
        }
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        for (let char of newCharList) {
            await delay(100);
            setCharList(charList => [...charList, char]);
        }
        setNewItemLoading(newItemLoading => false);
        setOffset(offset => offset + 9);
        setCharEnded(charEnded => ended);
        setAnimStart(setAnimStart => true);
    }


    const itemRefs = useRef([]);

    const focusOnItem = (id) => {
        itemRefs.current.forEach(item => item.classList.remove('char__item_selected'));
        itemRefs.current[id].classList.add('char__item_selected');
        itemRefs.current[id].focus();
    }

    function renderItems(arr) {

        const items = arr.map((item, i) => {
            let imgStyle = { 'objectFit': 'cover' };
            if (item.thumbnail === 'http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg') {
                imgStyle = { 'objectFit': 'unset' };
            }

            let delay = 0;
            const duration = 400;

            const defaultStyle = {
                transition: `all ${duration}ms ease-in-out`,
                opacity: 0,
                transform: 'translateY(-30%)',
                transitionDelay: `${delay}s`
            }

            const transitionStyles = {
                entering: { opacity: 0, transform: 'translateY(-10%)', transitionDelay: `${delay}s` },
                entered: { opacity: 1, transform: 'translateY(0)', transitionDelay: `${delay}s` },
                exiting: { opacity: 1, transform: 'translateY(0)', transitionDelay: `${delay}s` },
                exited: { opacity: 0, transform: 'translateY(20%)', transitionDelay: `${delay}s` },
            };

            if (i >= arr.length - 9) {
                delay += 0.1;
            }

            return (
                <Transition
                    in={animStart}
                    timeout={duration}
                    key={item.id}>
                    {state => (
                        <li
                            className="char__item" style={{
                                ...defaultStyle,
                                ...transitionStyles[state]
                            }}
                            tabIndex={0}
                            ref={el => itemRefs.current[i] = el}
                            key={item.id}
                            onClick={() => {
                                props.onCharSelected(item.id);
                                focusOnItem(i);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === ' ' || e.key === "Enter") {
                                    props.onCharSelected(item.id);
                                    focusOnItem(i);
                                }
                            }}>
                            <img src={item.thumbnail} alt={item.name} style={imgStyle} />
                            <div className="char__name">{item.name}</div>
                        </li>
                    )}
                </Transition>

            )
        });

        return (
            <ul className="char__grid">
                <TransitionGroup component={null}>
                    {items}
                </TransitionGroup>
            </ul>
        )
    }

    const items = renderItems(charList);

    const errorMessage = error ? <ErrorMessage /> : null;
    const spinner = loading && !newItemLoading ? <Spinner /> : null;

    // if (loading) {
    //     import('./someFunk')
    //         .then(obj => obj.logger())
    //         .catch();
    // }
    // if (loading) {
    //     import('./someFunk')
    //         .then(obj => obj.default())
    //         .catch();
    // }

    return (
        <div className="char__list">
            {errorMessage}
            {spinner}
            {items}
            <button
                className="button button__main button__long"
                disabled={newItemLoading} // отключаем кнопку при загрузке данных
                style={{ 'display': charEnded ? 'none' : 'block' }}
                onClick={() => onRequest(offset)}>
                <div className="inner">load more</div>
            </button>
        </div>
    )
}

CharList.propTypes = {
    onCharSelected: PropTypes.func.isRequired
}

export default CharList;
