import React, { useState } from 'react';
import './App.css';

function App() {
	const [sentenceInputOpen, setSentenceInputOpen] = useState<boolean>(true);
	const [sentenceTrainerOpen, setSentenceTrainerOpen] = useState<boolean>(false);
	const [sentences, setSentences] = useState<string[]>([]);

	const handleSentenceInputClose = (data: string): void => {
		setSentences(data.split(/\.|\?|!|\n/g).map((sentence) => sentence.trim()).filter(sentence => sentence.length > 0));
		setSentenceInputOpen(false);
		setSentenceTrainerOpen(true);
	};

	const handleSentenceTrainerClose = (): void => {
		setSentences([]);
		setSentenceInputOpen(true);
		setSentenceTrainerOpen(false);
	};

	return (
		<div>
			<SentenceInputDialog isOpen={sentenceInputOpen} onClose={handleSentenceInputClose} />
			<SentenceTrainer inputData={sentences} isOpen={sentenceTrainerOpen} onClose={handleSentenceTrainerClose} />
		</div>
	);
}


interface SimpleInputDialogProps {
	isOpen: boolean;
	onClose: (data: string) => void;
}

const SentenceInputDialog: React.FC<SimpleInputDialogProps> = ({ isOpen, onClose }) => {
	const [inputData, setInputData] = useState<string>('');

	const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInputData(event.target.value);
	};

	const handleSave = () => {
		onClose(inputData);
	};

	if (!isOpen) return null;

	return (
		<div style={{ position: 'fixed', top: '20%', left: '30%', width: '40%', background: 'white', padding: '20px', zIndex: 100 }}>
			<h1>Enter the sentences you want to practise</h1>
			<textarea
				rows={5}
				cols={50}
				value={inputData}
				onChange={handleInputChange}
				style={{ width: '100%' }}
			/>
			<div style={{ marginTop: '10px' }}>
				<button onClick={handleSave} style={{ marginRight: '10px' }}>Save</button>
			</div>
		</div>
	);
};

interface SimpleDialogWithInputProps {
	inputData: string[];
	isOpen: boolean;
	onClose: () => void;
}

const SentenceTrainer: React.FC<SimpleDialogWithInputProps> = ({ inputData, isOpen, onClose }) => {
	const [sentenceToCheck, setSentenceToCheck] = useState('');
	const [weightedSentences, setWeightedSentences] = useState(new Map<string, number>());
	const [inputSentence, setInputSentence] = useState('');
	const [sentenceCheckResult, setSentenceCheckResult] = useState<string>('');
	const [speechSynthesisPaused, setSpeechSynthesisPaused] = useState<boolean>(false);

	const handleSentenceInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInputSentence(event.target.value);
	};

	if (!isOpen) return null;

	if (!hasSameKeys(weightedSentences, inputData)) {
		weightedSentences.clear();
		for (const sentence of inputData) {
			weightedSentences.set(sentence.replaceAll('’', "'"), 1);
		};
	}

	// setSentenceToCheck is async but we can not use local state
	// in the repeat button callback as it has a different scope.
	// So we have to use the local var here and the global state in
	// the callback.
	let sentenceToCheckLocal: string = "";
	const showRandomLine = () => {
		const totalWeight = [...weightedSentences.values()].reduce((sum, val) => sum + val, 0);
		const threshold = Math.random() * totalWeight;

		let cursor = 0;
		for (const [sentence, weight] of weightedSentences.entries()) {
			cursor += weight;
			if (cursor >= threshold) {
				sentenceToCheckLocal = sentence;
				setWeightedSentences(weightedSentences.set(sentence, weight / 4));
				break;
			}
		}

		console.log("weights: ", weightedSentences);

		setSentenceToCheck(sentenceToCheckLocal);
		setInputSentence('');
		setSentenceCheckResult('');

		speak();
	};

	const resetWeighs = () => {
		for (const k of weightedSentences.keys()) {
			weightedSentences.set(k, 1);
		}
		setWeightedSentences(weightedSentences);
	}

	const speak = () => {
		let sentence = sentenceToCheckLocal;
		if (sentence === '') {
			sentence = sentenceToCheck;
		}
		const utterance = new SpeechSynthesisUtterance(sentence);
		for (const voice of speechSynthesis.getVoices()) {
			if (voice.lang === 'fr-FR') {
				utterance.voice = voice;
				if (voice.name === 'Google français' || voice.name === 'Audrey (Premium)') {
					break
				}
				// Missing break is not a bug. We use Google français if available, otherwise
				// fall through to the last.
			}
		}
		utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
			console.error("Speech synthesis error:", event.error);
		};
		setSpeechSynthesisPaused(false);
		utterance.rate = 0.8;
		speechSynthesis.cancel();
		speechSynthesis.resume();
		speechSynthesis.speak(utterance);
	};

	function highlightDifferences(str1: string, str2: string): string {
		const diff = require('diff'); // Import diff library

		const changes = diff.diffChars(str1, str2);

		let result = '';
		for (const change of changes) {
			if (change.added) {
				result += `<span style="color: green; font-weight: bold;">${change.value}</span>`;
			} else if (change.removed) {
				result += `<span style="color: red; font-weight: bold;">${change.value}</span>`;
			} else {
				result += change.value;
			}
		}

		return result;
	};

	const checkSentence = () => {
		speechSynthesis.cancel();
		let weight: number = weightedSentences.get(sentenceToCheck) ?? 0;
		let toCompare = inputSentence;
		if (toCompare.endsWith("?")) {
			toCompare = inputSentence.slice(0, -1);
		}
		if (toCompare === sentenceToCheck) {
			setSentenceCheckResult("You got it right!");
			weight /= 4;
		} else {
			setSentenceCheckResult("Not quite: " + highlightDifferences(inputSentence, sentenceToCheck));
			weight *= 4;
		}
		setWeightedSentences(weightedSentences.set(sentenceToCheck, weight));
	};

	const close = () => {
		setSentenceToCheck('');
		resetWeighs();
		onClose();
	}

	const pauseResume = () => {
		if (speechSynthesisPaused) {
			speechSynthesis.resume();
			setSpeechSynthesisPaused(false);
			console.log("resuming");
		} else {
			setSpeechSynthesisPaused(true);
			speechSynthesis.pause();
			console.log("pausing");
		}
	};

	const tryAgain = () => {
		setSentenceCheckResult('');
		speak();
	};

	return (
		<div style={{ position: 'fixed', top: '20%', left: '30%', width: '40%', background: 'white', padding: '20px', zIndex: 100 }}>
			<div style={{ width: "90%", height: "40%", display: "block", margin: "0 auto" }}>
				{sentenceToCheck && !sentenceCheckResult &&
					<div>
						<textarea
							rows={5}
							cols={50}
							onChange={handleSentenceInputChange}
							style={{ width: '100%' }}
						/>
						<button onClick={speak}>Repeat</button>
						<button onClick={pauseResume}>Pause/Resume</button>
						<button onClick={checkSentence}>Check</button>
					</div>
				}
				{sentenceCheckResult &&
					<div>
						<p dangerouslySetInnerHTML={{ __html: sentenceCheckResult }} />
						<button onClick={tryAgain}>Try Again</button>
					</div>
				}
				<p> There are {inputData.length} sentences </p>
				<button onClick={showRandomLine}>Practise random sentence</button>
				<button onClick={resetWeighs}>Reset weights</button>
				<button onClick={close}>Clear sentences</button>
			</div>
		</div>
	);
};

function hasSameKeys<K>(map: Map<K, any>, keys: K[]): boolean {
	if (map.size !== keys.length) {
		return false;
	}

	for (const item of keys) {
		if (!map.has(item)) {
			return false;
		}
	}

	return true;
}

export default App;
