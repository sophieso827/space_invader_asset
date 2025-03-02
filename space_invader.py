import pygame
import random
import sys
import os

# Initialize pygame
pygame.init()

# Initialize the mixer for sound and music
pygame.mixer.init()

# Game Constants
WIDTH, HEIGHT = 800, 600
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
BLUE = (0, 0, 255)
FONT_SIZE = 40
FONT = pygame.font.Font(None, FONT_SIZE)
FPS = 60

# Asset folder
ASSET_FOLDER = os.path.join(os.path.expanduser("~"), "Desktop", "space_invader_asset")

# Function to load assets
def load_asset(asset_type, filename, size=None):
    path = os.path.join(ASSET_FOLDER, filename)
    print(f"Loading asset: {path}")  # Add this line to log the asset loading attempt
    try:
        if asset_type == 'image':
            image = pygame.image.load(path)
            if size:
                image = pygame.transform.scale(image, size)
            return image
        elif asset_type == 'sound':
            return pygame.mixer.Sound(path)
        else:
            raise ValueError("Unsupported asset type")
    except pygame.error as e:
        print(f"Error loading {asset_type}: {filename} - {e}")
        sys.exit()

# Load assets
BACKGROUND = load_asset('image', 'background.png', (WIDTH, HEIGHT))
spaceship_img = load_asset('image', 'spaceship.png', (50, 50))
bullet_img = load_asset('image', 'bullet.png', (20, 40))
heart_img = load_asset('image', 'heart.png', (30, 30))
swoosh_sound = load_asset('sound', 'swoosh.mp3')
explosion_sound = load_asset('sound', 'explosion.mp3')
shooting_sound = load_asset('sound', 'shooting.mp3')
chinese_font = pygame.font.Font(os.path.join(ASSET_FOLDER, "jf-openhuninn-2.0.ttf"), 80)

# Setup screen
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Space Invaders - Learn English")

# List of Chinese words and their corresponding English words
word_pairs = [
    {"chinese": "蘋果", "english": "apple"},
    {"chinese": "香蕉", "english": "banana"},
    {"chinese": "櫻桃", "english": "cherry"},
    {"chinese": "葡萄", "english": "grape"},
    {"chinese": "交通", "english": "transport"},
    {"chinese": "訊息", "english": "message"},
    {"chinese": "最快的", "english": "fastest"},
    {"chinese": "歐洲", "english": "Europe"},
    {"chinese": "之間", "english": "between"},
    {"chinese": "國家", "english": "country"},
]

# Initialize game state
current_round = 0
score = 0
lives = 3  # Start with 3 lives
chinese_word = word_pairs[current_round]["chinese"]
correct_english_word = word_pairs[current_round]["english"]
words = []  # Initialize the list of English words to display
word_rects = []
word_speeds = []
word_boxes = []

# Track words that are hit and need to fall off
falling_words = []  # List of dictionaries: {"word": word, "rect": rect, "speed": speed}
missed_words = []  # Track words that fell off but are waiting to be re-spawned

# Function to check if two rectangles overlap
def rectangles_overlap(rect1, rect2):
    return (rect1.x < rect2.x + rect2.width and
            rect1.x + rect1.width > rect2.x and
            rect1.y < rect2.y + rect2.height and
            rect1.y + rect1.height > rect2.y)

# Function to reset the game state for the next round
def reset_round():
    global chinese_word, correct_english_word, words, word_rects, word_speeds, word_boxes, show_chinese, chinese_timer, chinese_y_pos
    chinese_word = word_pairs[current_round]["chinese"]
    correct_english_word = word_pairs[current_round]["english"]
    
    # Initialize the words list with the correct word and two random incorrect words
    words = [correct_english_word]  # Start with the correct word
    while len(words) < 3:  # Ensure there are 3 words in total
        random_word = random.choice([pair["english"] for pair in word_pairs if pair["english"] != correct_english_word])  # Choose a random incorrect word
        if random_word not in words:  # Avoid duplicates
            words.append(random_word)
    
    # Shuffle the words list to randomize their order
    random.shuffle(words)
    
    # Reset word positions and speeds
    word_rects.clear()  # Clear the falling words rects
    word_speeds.clear()  # Clear the falling words speeds
    word_boxes.clear()  # Clear the word boxes
    show_chinese = True
    chinese_timer = pygame.time.get_ticks()
    chinese_y_pos = -100

    # Play the swoosh sound effect when the Chinese word appears
    swoosh_sound.play()

# Function to spawn a new word
def spawn_word(word):
    x_pos = random.randint(50, WIDTH - 150)  # Leave space for the box
    y_pos = random.randint(-HEIGHT, -50)  # Start above the screen
    text = FONT.render(word, True, BLACK)
    text_width, text_height = text.get_size()
    box_width = text_width + 40
    box_height = text_height + 20

    box_rect = pygame.Rect(x_pos, y_pos, box_width, box_height)
    word_rects.append(pygame.Rect(x_pos, y_pos, text_width, text_height))
    word_boxes.append(box_rect)
    word_speeds.append(random.randint(1, 3))  # Standard speed for words

    words.append(word)  # Add the word to the words list as well

# Initialize the first round
reset_round()

# Display Chinese word at the start
show_chinese = True
chinese_timer = pygame.time.get_ticks()
chinese_y_pos = -100  # Start above the screen
ANIMATION_SPEED = 5  # Speed of the animation

# Play background music
try:
    pygame.mixer.music.load(os.path.join(ASSET_FOLDER, "background_music.mp3"))
    pygame.mixer.music.play(-1, 0.0)
except pygame.error as e:
    print(f"Error loading background music: {e}")

# Track key states
keys = {
    pygame.K_LEFT: False,
    pygame.K_RIGHT: False
}

# Initialize timer
COUNTDOWN_TIME = 5 * 60  # 5 minutes in seconds
start_time = pygame.time.get_ticks()  # Record the start time

# Game loop
clock = pygame.time.Clock()
running = True
while running:
    screen.blit(BACKGROUND, (0, 0))

    # Calculate remaining time
    elapsed_time = (pygame.time.get_ticks() - start_time) // 1000  # Convert to seconds
    remaining_time = max(0, COUNTDOWN_TIME - elapsed_time)  # Ensure time doesn't go negative
    minutes = remaining_time // 60
    seconds = remaining_time % 60
    timer_text = FONT.render(f"{minutes:02}:{seconds:02}", True, WHITE)  # Timer color changed to white
    screen.blit(timer_text, (20, 20))  # Display timer in the upper-left corner

    # Show Chinese word at the start
    if show_chinese:
        # Move the Chinese word from top to center
        if chinese_y_pos < (HEIGHT // 2 - 50):  # 50 is half the estimated height of the text
            chinese_y_pos += ANIMATION_SPEED

        # Render Chinese word with the custom font
        text = chinese_font.render(chinese_word, True, BLACK)

        # Calculate the size of the text
        text_width, text_height = text.get_size()

        # Define the box dimensions
        box_width = text_width + 40  # Add padding
        box_height = text_height + 20  # Add padding

        # Center the box horizontally
        box_x = (WIDTH - box_width) // 2

        # Position the text within the box (aligned to the left)
        text_x = box_x + 20  # Add padding to align text to the left
        text_y = chinese_y_pos + 10  # Add padding to align text vertically

        # Draw the background box for the word
        box_rect = pygame.Rect(box_x, chinese_y_pos, box_width, box_height)
        pygame.draw.rect(screen, WHITE, box_rect, border_radius=10)
        
        # Display the text
        screen.blit(text, (text_x, text_y))
        
        # Hide the Chinese word after 4 seconds
        if pygame.time.get_ticks() - chinese_timer > 4000:  # Show for 4 seconds
            show_chinese = False
            # Now spawn English words immediately after Chinese word disappears
            for word in words:
                spawn_word(word)

    # Draw English words after Chinese word disappears
    if not show_chinese:
        for i, word_rect in enumerate(word_rects):
            word = words[i]
            word_speed = word_speeds[i]
            box_rect = word_boxes[i]
            pygame.draw.rect(screen, WHITE, box_rect, border_radius=10)  # Draw box
            word_text = FONT.render(word, True, BLACK)
            screen.blit(word_text, (word_rect.x + 20, word_rect.y + 10))  # Add padding
            word_rect.y += word_speed  # Move the word downward
            
            if word_rect.y > HEIGHT:  # Word has fallen below the screen
                missed_words.append(word_rect)
                word_rects.remove(word_rect)
                words.remove(word)
                word_boxes.remove(box_rect)

            # Check for bullet collisions
            for bullet in bullets:
                if rectangles_overlap(bullet.rect, word_rect):
                    # Destroy bullet and word
                    bullets.remove(bullet)
                    word_rects.remove(word_rect)
                    words.remove(word)
                    word_boxes.remove(box_rect)
                    score += 10
                    explosion_sound.play()

    # Game over condition
    if remaining_time == 0 or lives == 0:
        running = False

    pygame.display.update()
    clock.tick(FPS)