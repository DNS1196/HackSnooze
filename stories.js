
"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const showStar = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
      ${showDeleteBtn ? deleteBtnHTML() : ""}
      ${showStar ? starBtnHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function starBtnHTML(story, user) {
  const isFav = user.isFav(story);
  const star = isFav ? "fas" : "far";
  return `<span class="star">
  <i class="${star} fa-star"></i>
</span>`
}

function deleteBtnHTML() {
  return `
  <span class="trash-can">
    <i class="fas fa-trash-alt"></i>
  </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
  hidePageComponents();
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function submitStory(evt) {
  console.debug("submitStory");
  evt.preventDefault();
  const author = $("#create-author").val();
  const title = $("#create-title").val();
  const url = $("#create-url").val();
  const username = currentUser.username;
  const storyData = { title, url, author, username };

  const story = await storyList.addStory(currentUser, storyData);
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
  $submitForm.slideUp(600);
  $submitForm.trigger("reset");
}
$submitForm.on("submit", submitStory);

function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");
  hidePageComponents();
  $favStories.html('')
  if (currentUser.favorites.length === 0) {
    $favStories.append("<h5>No favorites added!</h5>")
  }
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favStories.append($story);
  }
  $favStories.show();
}

async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite", evt);
  const $target = $(evt.target);
  const $closestLi = $target.closest("li")
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  if ($target.hasClass("fas")) {
    await currentUser.removeFav(story);
    $target.closest("i").toggleClass("fas far");
  } else {
    await currentUser.addFav(story);
    $target.closest("i").toggleClass("fas far");
  }
}

$body.on("click", ".star", toggleStoryFavorite)

function putUserStoriesOnPage() {
  console.debug("putFavoritesListOnPage");
  $ownStories.empty();

  if (currentUser.ownStories.length === 0) {
    $ownStories.append(`<h5>No stories have been added by ${currentUser.username}.</h5>`)
  } else {
    for (let story of currentUser.ownStories) {
      const $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }
  $ownStories.show();
}

async function deleteStory(evt) {
  console.debug("deleteStory", evt);
  const $closestLi = $(evt.target).closest("li")
  const storyId = $closestLi.attr("id");
  await storyList.removeStory(currentUser, storyId);
  await putUserStoriesOnPage();

}
$ownStories.on("click", ".trash-can", deleteStory);