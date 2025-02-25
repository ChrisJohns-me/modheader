<script>
  import Drawer, { Content } from '@smui/drawer';
  import MenuSurface from '@smui/menu-surface';
  import List, { Item, Text, Separator } from '@smui/list';
  import {
    mdiCheckboxBlankOutline,
    mdiCheckboxMarked,
    mdiClose,
    mdiHelpCircleOutline,
    mdiThumbUpOutline,
    mdiSortAscending,
    mdiSortDescending,
    mdiChevronLeft,
    mdiMenu,
    mdiFilePlus
  } from '@mdi/js';
  import { fade } from 'svelte/transition';
  import MdiIcon from './MdiIcon.svelte';
  import ProfileBadge from './ProfileBadge.svelte';
  import ProFeature from './ProFeature.svelte';
  import { showMessage } from '../js/toast.js';
  import { profiles } from '../js/datasource.js';
  import { CURRENT_BROWSER } from '../js/user-agent.js';
  import {
    addProfile,
    removeProfile,
    selectProfile,
    selectedProfile,
    updateProfile,
    sortProfiles
  } from '../js/profile';
  import { PRIMARY_COLOR } from '../js/constants';

  let drawer;
  let drawerOpen = true;
  let expand = false;
  let sortOrder = 'asc';
  let contextMenu;
  let contextMenuAnchor;
  let selectedProfileIndex;

  function showMenu(event, { profileIndex }) {
    contextMenu.setOpen(false);
    setTimeout(() => {
      selectedProfileIndex = profileIndex;
      contextMenuAnchor = event.target;
      contextMenu.setIsHoisted(true);
      contextMenu.setOpen(true);
    }, 0);
    event.preventDefault();
  }

  function openLink(url) {
    chrome.tabs.create({ url });
  }
</script>

<Drawer
  class="main-drawer {expand ? 'main-drawer-expand' : 'main-drawer-collapsed'}"
  variant="dismissible"
  bind:this={drawer}
  bind:open={drawerOpen}
>
  <Content class="main-drawer {expand ? 'main-drawer-expand' : 'main-drawer-collapsed'}">
    <List class="main-drawer-list">
      <Item
        class="main-drawer-item"
        title={expand ? 'Hide navigation' : 'Show navigation'}
        on:click={() => {
          expand = !expand;
        }}
      >
        <span class="main-drawer-icon-container">
          <MdiIcon
            size="24"
            class="main-drawer-icon"
            icon={expand ? mdiChevronLeft : mdiMenu}
            color={PRIMARY_COLOR}
          />
        </span>
      </Item>
      <Separator nav />

      <div class="profiles-list">
        {#each $profiles as profile, profileIndex}
          <Item
            class="main-drawer-item"
            title={profile.title}
            selected={$selectedProfile === profile}
            on:contextmenu={(e) => {
              showMenu(e, { profile, profileIndex });
            }}
            on:click={() => {
              selectProfile(profileIndex);
              expand = false;
            }}
          >
            <ProfileBadge {profile} />
            <Text class="main-drawer-item-text">{profile.title}</Text>
          </Item>
        {/each}
        <ProFeature requirePro={$profiles.length >= 3} let:upgradeRequired>
          <Item
            class="main-drawer-item"
            title={upgradeRequired ? 'Upgrade to Pro to add more profiles' : 'Add profile'}
            on:click={() => {
              addProfile();
              expand = false;
            }}
          >
            <span class="main-drawer-icon-container">
              <MdiIcon
                size="24"
                class="main-drawer-icon"
                icon={mdiFilePlus}
                color={PRIMARY_COLOR}
              />
            </span>
            <Text class="main-drawer-item-text">Add profile</Text>
          </Item>
        </ProFeature>
        <Item
          class="main-drawer-item"
          title="Sort profiles"
          on:click={() => {
            sortProfiles(sortOrder);
            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
          }}
        >
          <span class="main-drawer-icon-container">
            <MdiIcon
              size="24"
              class="main-drawer-icon"
              icon={sortOrder === 'asc' ? mdiSortAscending : mdiSortDescending}
              color={PRIMARY_COLOR}
            />
          </span>
          <Text class="main-drawer-item-text">Sort profiles</Text>
        </Item>
      </div>

      <Separator nav />
      <Item
        class="main-drawer-item"
        title="Rate us"
        on:click={() => openLink('https://modheader.com/review?browser=' + CURRENT_BROWSER)}
      >
        <span class="main-drawer-icon-container">
          <MdiIcon
            size="24"
            class="main-drawer-icon"
            icon={mdiThumbUpOutline}
            color={PRIMARY_COLOR}
          />
        </span>
        <Text class="main-drawer-item-text">Rate us</Text>
      </Item>
      <Item
        class="main-drawer-item"
        title="Help"
        on:click={() => openLink('https://modheader.com/guide/')}
      >
        <span class="main-drawer-icon-container">
          <MdiIcon
            size="24"
            class="main-drawer-icon"
            icon={mdiHelpCircleOutline}
            color={PRIMARY_COLOR}
          />
        </span>

        <Text class="main-drawer-item-text">Help</Text>
      </Item>
    </List>
  </Content>
</Drawer>

<MenuSurface bind:this={contextMenu} bind:anchorElement={contextMenuAnchor} quickOpen>
  <List>
    <Item
      on:SMUI:action={() => {
        const profile = $profiles[selectedProfileIndex];
        const alwaysOn = !profile.alwaysOn;
        updateProfile({ alwaysOn }, selectedProfileIndex);
        if (alwaysOn) {
          showMessage(`${profile.title} will stay active even when it is not selected`);
        } else {
          showMessage(`${profile.title} will only be active when selected.`);
        }
      }}
    >
      <MdiIcon
        class="more-menu-icon"
        size="24"
        icon={($profiles[selectedProfileIndex] || {}).alwaysOn
          ? mdiCheckboxMarked
          : mdiCheckboxBlankOutline}
        color="#666"
      />
      <Text>Always stay on</Text>
    </Item>
    <Item
      on:SMUI:action={() => {
        contextMenu.setOpen(false);
        removeProfile(selectedProfileIndex);
      }}
    >
      <MdiIcon class="more-menu-icon" size="24" icon={mdiClose} color="red" />
      <Text>Delete profile</Text>
    </Item>
  </List>
</MenuSurface>

{#if expand}
  <div class="scrim" transition:fade={{ duration: 200 }} on:click={() => (expand = false)} />
{/if}

<style module>
  .main-drawer {
    display: block;
    position: fixed;
    left: 0;
    top: 0;
    overflow-x: hidden;
    scrollbar-width: none;
    transition: width 0.2s ease-out;
  }

  .main-drawer::-webkit-scrollbar {
    display: none;
  }

  .main-drawer-expand {
    width: 256px;
  }

  .main-drawer-collapsed {
    width: 36px;
  }

  .main-drawer-item {
    padding: 0 !important;
    margin: 0 !important;
  }

  .main-drawer-item-text {
    font-size: 16px;
    margin-left: 5px;
  }

  .main-drawer-icon-container {
    color: white;
    font-size: 16px;
    border-radius: 25px;
    margin: 10px 6px;
  }

  .main-drawer-icon {
    padding-top: 4px;
  }

  .main-drawer-list {
    margin: 2px 0;
    padding: 0;
  }

  .profiles-list {
    min-height: var(--profiles-list-min-height);
  }

  .scrim {
    background: #ccc;
    opacity: 0.7;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
  }
</style>
