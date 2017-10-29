import nltk
from google.cloud import translate
import os
import random

nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "auth.json"

def translate_text(target, text):
    translate_client = translate.Client()
    text = text.decode('utf-8')
    result = translate_client.translate(text, target_language=target)
    return result['translatedText']

def random_chance(diff):
    x = (80*diff/9) + (100/9);

    if random.randint(0,99) <=  x :
        return True
    else:
        return False


paragraph = "Terry didn't consider himself particularly unusual. Sure, he spent his teenage years as a willing and sometimes absurdly cheerful social outcast, upon adulthood immediately transitioned to playing side-kick to a magic-savvy private investigator, accidentally became the confidant of an apparently ageless time-traveler, and just recently declared war on a corporation widely recognized as one of the top ten charitable organizations in the world, but he figured most people had a few weird phases in their lives."

# N, V, or A
type = "N"

language = "zh"

# Difficulty 1-10 20% - 100%
difficulty = 10;


# Parses words into vector
words = nltk.word_tokenize(paragraph);

# IDs words, places in tuples with first element as word and second as Part of Speech
partOfSpeech = nltk.pos_tag(words)

toTranslate = []
translated = []

# Iterates through part of speech and saves locations of nouns
for idx, i in enumerate(partOfSpeech):
    if random_chance(difficulty):
        if i[1][:2] == "NN" and type == "N" :
            toTranslate.append(i[0])
            translated.append(translate_text(language, i[0]))
        if i[1][:2] == "JJ" and type == "J":
            toTranslate.append(i[0])
            translated.append(translate_text(language, i[0]))
        if i[1][:1] == "V" and type == "V":
            toTranslate.append(i[0])
            translated.append(translate_text(language, i[0]))

css = ""

for i in range( len(toTranslate)-1 ):
    location = paragraph.find( toTranslate[i], 0, len(paragraph) )
    paragraph = paragraph[0:location] + "<code id='f"+ str(i) +"'></code>" + paragraph[location + len(toTranslate[i]):]
    css += "#f" + str(i) + ":after{content: '" + translated[i] + "';}\n#f" + str(i) + ":hover:after{content: '" + toTranslate[i] + "';}\n\n"

#print paragraph
print css
