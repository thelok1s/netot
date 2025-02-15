import json
import os
import shutil

paths = ["Q"+str(i) for i in range(1, 34)]


def process_directory(path):
    # Create wrong_answers directory if it doesn't exist
    if not os.path.exists('wrong_answers'):
        os.makedirs('wrong_answers')

    # Load validation data
    with open(f'./{path}/validation.json', 'r') as file:
        validation = json.load(file)

    # Get all files in directory and convert to lowercase for comparison
    files_in_dir = {f.lower(): f for f in os.listdir(f'./{path}/')}

    # Process all files in directory
    for filename in list(files_in_dir.values()):  # Use original filenames
        # Handle A files - move wrong answers
        if filename.upper().startswith('A'):
            try:
                folder_num = filename[1:3]    # XX (Q folder number)
                question_num = str(int(filename[3:5]))   # YY (question number)
                answer_num = str(int(filename[5:7]))     # ZZ (answer number)

                # Check if P file exists for this question (case insensitive)
                p_filename_pattern = f'P{folder_num}{filename[3:5]}'
                p_file_exists = any(f.upper().startswith(p_filename_pattern.upper()) and 
                                  any(f.upper().endswith(ext.upper()) for ext in ['.RTF', '.rtf'])
                                  for f in files_in_dir.values())

                if p_file_exists:
                    print(f"Skipping {filename} - P file exists")
                    continue

                if question_num in validation:
                    if answer_num in validation[question_num]:
                        val = validation[question_num][answer_num]
                        if isinstance(val, (int, float)) and val == 0:
                            source_path = os.path.join(path, filename)
                            dest_path = os.path.join('wrong_answers', filename)
                            shutil.move(source_path, dest_path)
                            print(f"Moved {filename} to wrong_answers/")

            except (ValueError, IndexError) as e:
                print(f"Error processing file {filename}: {str(e)}")
                continue

        # Handle P files - generate answer files
        elif filename.upper().startswith('P'):
            try:
                folder_num = filename[1:3]    # XX (Q folder number)
                question_num = str(int(filename[3:5]))   # YY (question number)

                # Get answer from validation
                if question_num in validation:
                    answer = validation[question_num]["1"]  # Get first answer

                    # Create answer filename
                    padded_q = question_num.zfill(2)
                    answer_filename = f'A{folder_num}{padded_q}01.txt'

                    # Check if answer file exists (case insensitive)
                    answer_exists = any(f.upper() == answer_filename.upper() 
                                     for f in files_in_dir.values())

                    # Create answer file with the answer
                    dest_path = os.path.join(path, answer_filename)

                    if not answer_exists:  # Only create if doesn't exist
                        with open(dest_path, 'w') as f:
                            f.write(str(answer))
                        print(f"Created {answer_filename} with answer: {answer}")
                    else:
                        print(f"Skip: {answer_filename} already exists")

            except (ValueError, IndexError) as e:
                print(f"Error processing file {filename}: {str(e)}")
                continue


if __name__ == "__main__":
    for path in paths:
        try:
            print(f"\nProcessing directory: {path}")
            process_directory(path)
            print(f"Completed processing {path}")
        except Exception as e:
            print(f"Error processing {path}: {str(e)}")