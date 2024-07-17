import { useState, useEffect } from 'react';
import Spinner from '../spinner/Spinner';
import ErrorMessage from '../errorMessage/ErrorMessage';
import useMarvelService from '../../services/MarvelService';
import { Transition, TransitionGroup } from 'react-transition-group';

import './randomChar.scss';
import mjolnir from '../../resources/img/mjolnir.png';


const RandomChar = () => {
    const [char, setChar] = useState(null);
    const { loading, error, getCharacter, clearError } = useMarvelService();
    const [animRanStart, setAnimRanStart] = useState(false);

    useEffect(() => {
        updateChar();
        const timerId = setInterval(updateChar, 60000);

        return () => {
            clearInterval(timerId);
        };
    }, []);

    const onCharLoaded = (char) => {
        setChar(char);
        setAnimRanStart(true);
    };

    const updateChar = () => {
        clearError();
        const id = Math.floor(Math.random() * (1011400 - 1011000)) + 1011000;
        getCharacter(id).then(onCharLoaded);
    };

    const errorMessage = error ? <ErrorMessage /> : null;
    const spinner = loading ? <Spinner /> : null;
    const content = !(loading || error || !char) ? <View char={char} animRanStart={animRanStart} /> : null;

    return (

        <TransitionGroup>
            <div className="randomchar">
                {errorMessage}
                {spinner}
                {content}
                <div className="randomchar__static">
                    <p className="randomchar__title">
                        Random character for today!<br />
                        Do you want to get to know him better?
                    </p>
                    <p className="randomchar__title">
                        Or choose another one
                    </p>
                    <button onClick={updateChar} className="button button__main">
                        <div className="inner">try it</div>
                    </button>
                    <img src={mjolnir} alt="mjolnir" className="randomchar__decoration" />
                </div>
            </div>
        </TransitionGroup>

    );
};

const View = ({ char, animRanStart }) => {
    const { name, description, thumbnail, homepage, wiki } = char;
    let imgStyle = { 'objectFit': 'cover' };
    if (thumbnail === 'http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg') {
        imgStyle = { 'objectFit': 'contain' };
    }

    const duration = 300;
    const delay = 100;

    const defaultStyle = {
        transition: `opacity ${duration}ms ease-in-out ${delay}ms, transform ${duration}ms ease-in-out ${delay}ms`,
        opacity: 0,
        transform: 'translateX(-100%)',
    };

    const transitionStyles = {
        entering: { opacity: 0, transform: 'translateX(-100%)' },
        entered: { opacity: 1, transform: 'translateX(0)' },
        exiting: { opacity: 1, transform: 'translateX(0)' },
        exited: { opacity: 0, transform: 'translateX(100%)' },
    };

    return (
        <Transition
            in={animRanStart} timeout={duration} key={char.id}>
            {state => (
                <div
                    className="randomchar__block" style={{
                        ...defaultStyle,
                        ...transitionStyles[state]
                    }}>
                    <img src={thumbnail} alt="Random character" className="randomchar__img" style={imgStyle} />
                    <div className="randomchar__info">
                        <p className="randomchar__name">{name}</p>
                        <p className="randomchar__descr">{description}</p>
                        <div className="randomchar__btns">
                            <a href={homepage} className="button button__main">
                                <div className="inner">homepage</div>
                            </a>
                            <a href={wiki} className="button button__secondary">
                                <div className="inner">Wiki</div>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </Transition>
    );
};

export default RandomChar;
