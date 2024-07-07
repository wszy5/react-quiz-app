import React, { useState } from 'react';
import axios from 'axios';
import { FaGithub } from "react-icons/fa";
import { VscDebugRestart } from "react-icons/vsc";
import { CiPlay1 } from "react-icons/ci";
import './App.css';
import pyra from './pyra.png';
import rogal from './rogal.png';
import koziolek from './koziolek.png';
import blad from './blad.png';

const App = () => {
  const [amount, setAmount] = useState(1);
  const [level, setLevel] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    setSelectedAnswers({});
    setCorrectAnswers({});
    setScore(0);
    setQuizCompleted(false);
    try {
      const response = await axios.get('https://frog01-20911.wykr.es/questions/', {
        params: {
          questionAmount: amount,
          questionLevel: level
        }
      });

      const shuffledQuestions = response.data.map(question => {
        const correctOption = question.options.a; // The first option is correct
        const options = [
          { key: 'a', value: question.options.a },
          { key: 'b', value: question.options.b },
          { key: 'c', value: question.options.c },
        ];

        // Shuffle the options array
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }

        // Convert the shuffled options back to an object
        const shuffledOptions = {};
        options.forEach((option, index) => {
          shuffledOptions[String.fromCharCode(97 + index)] = option.value;
        });

        return {
          ...question,
          options: shuffledOptions,
          correctOption: correctOption // Store the correct option for checking later
        };
      });

      setQuestions(shuffledQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
    setLoading(false);
  };

  const handleAnswerClick = (questionIndex, selectedOption) => {
    if (selectedAnswers[questionIndex] !== undefined) {
      return; // Prevent changing the answer once selected
    }

    const newSelectedAnswers = { ...selectedAnswers, [questionIndex]: selectedOption };
    setSelectedAnswers(newSelectedAnswers);

    const correctOption = questions[questionIndex].correctOption;
    const isCorrect = questions[questionIndex].options[selectedOption] === correctOption;

    const newCorrectAnswers = { ...correctAnswers, [questionIndex]: isCorrect };
    setCorrectAnswers(newCorrectAnswers);

    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }

    if (Object.keys(newSelectedAnswers).length === questions.length) {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setAmount(1);
    setLevel(1);
    setQuestions([]);
    setSelectedAnswers({});
    setCorrectAnswers({});
    setScore(0);
    setQuizCompleted(false);
  };

  const getResultImage = () => {
    if (score / questions.length < 0.5) {
      return blad; 
    } else {
      const successImages = [rogal, pyra, koziolek]; // Use actual paths
      return successImages[Math.floor(Math.random() * successImages.length)];
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Quiz o gwarze wielkopolskiej</h1>
        {questions.length === 0 && (
          <>
            <div className="form-group">
              <label>Ilość pytań:</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                min="1" 
                max="10" 
              />
            </div>
            <div className="form-group">
              <label>Poziom trudności:</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
            <button onClick={fetchQuestions} disabled={loading}>
            <CiPlay1 />
              {loading ? "Ładowanie..." : "Start"}
            </button>
            <br></br>
            <br></br>
            <span id="sign">
              <a href="https://github.com/wszy5" target='_blank' rel='noreferrer'>            
              &copy; Wiktor Szymański &nbsp; 
              <FaGithub />
              </a>
              </span>
          </>
        )}
        
        {questions.length > 0 && (
          <div className="quiz">
            {questions.map((question, index) => (
              <div key={index} className="question">
                <h3>{question.word}</h3>
                <ul>
                  {Object.entries(question.options).map(([key, value]) => (
                    <li
                      key={key}
                      className={
                        selectedAnswers[index] === key
                          ? correctAnswers[index]
                            ? 'correct'
                            : 'incorrect'
                          : ''
                      }
                      onClick={() => handleAnswerClick(index, key)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor:
                          selectedAnswers[index] === key
                            ? correctAnswers[index]
                              ? 'lightgreen'
                              : 'lightcoral'
                            : '#f9f9f9'
                      }}
                    >
                      {key}: {value}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {quizCompleted && (
          <div className="result">
            <h2>Twój wynik: {score} / {questions.length}</h2>
            <img src={getResultImage()} alt="Result" />
            <button onClick={resetQuiz}>
            <VscDebugRestart />
              Zacznij od nowa
              </button>
            <span>
              <a href="https://github.com/wszy5" target='_blank' rel='noreferrer'>&copy; Wiktor Szymański &nbsp;</a>
              <FaGithub />
              </span> 
          </div>
        )}
      </header>
      
    </div>
  );
};

export default App;
